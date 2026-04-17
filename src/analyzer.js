import OpenAI from 'openai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// 初始化 OpenAI 兼容客户端（支持 StepFun、Anthropic 等多种后端）
const openai = new OpenAI({
  apiKey: process.env.API_KEY || process.env.ANTHROPIC_API_KEY || process.env.STEP_API_KEY,
  baseURL: process.env.API_BASE_URL || 'https://api.stepfun.com/v1'
});

/**
 * 分析人 Skill - 三层递进训练法
 * 基于微信文章《分析人的训练》
 */

// 输入验证 Schema
const InputSchema = z.object({
  targetName: z.string().min(1, "目标姓名不能为空"),
  relation: z.string().min(1, "关系不能为空"),
  knownFacts: z.array(z.object({
    description: z.string().min(10, "事例描述至少10字"),
    category: z.enum(['behavior', 'speech', 'background', 'appearance']),
    context: z.string().optional(),
    confidence: z.number().min(0).max(100).optional().default(80)
  })).min(5, "至少提供5个具体事例"),
  hypotheses: z.array(z.string()).optional().default([]),
  observationPeriod: z.string().optional().default("未指定"),
  trainingLevel: z.enum(['level1', 'level2', 'level3']).default('level1')
});

// 输出 Schema
const ResultSchema = z.object({
  level: z.string(),
  weaknessAnalysis: z.object({
    abilityWeaknesses: z.array(z.string()),
    characterWeaknesses: z.array(z.string()),
    backgroundWeaknesses: z.array(z.string()),
    coreTraits: z.array(z.string())
  }),
  sixPlusTwo: z.object({
    familyBackground: z.object({
      economicStatus: z.string(),
      inference: z.string(),
      evidence: z.array(z.string()),
      confidence: z.number()
    }),
    parentRelationship: z.object({
      status: z.string(),
      evidence: z.array(z.string()),
      impactOnPerson: z.string()
    }),
    growthExperience: z.object({
      resistanceLevel: z.string(),
      educationStyle: z.string(),
      formedTraits: z.array(z.string())
    }),
    psychology: z.object({
      personalityType: z.string(),
      emotionPattern: z.string(),
      stability: z.string(),
      contradictions: z.array(z.string())
    }),
    thinkingMode: z.object({
      primaryMode: z.string(),
      logicAbility: z.string(),
      thinkingHabits: z.array(z.string())
    }),
    behaviorStyle: z.object({
      timeManagement: z.string(),
      selfStandard: z.string(),
      othersStandard: z.string(),
      contradictions: z.array(z.string())
    }),
    excitementPoints: z.object({
      triggerScenes: z.array(z.string()),
      behaviorWhenExcited: z.string(),
      utilizationAdvice: z.string(),
      confidence: z.number()
    }),
    vulnerabilityPoints: z.object({
      triggerScenes: z.array(z.string()),
      behaviorWhenDown: z.string(),
      interventionMethods: z.array(z.string()),
      warning: z.string()
    })
  }),
  causalChain: z.object({
    externalConditions: z.array(z.string()),
    internalManifestations: z.array(z.string()),
    mechanism: z.string(),
    contradictions: z.array(z.object({
      surface: z.string(),
      rootCause: z.string(),
      evidence: z.string()
    }))
  }),
  intervention: z.object({
    positive: z.object({
      methods: z.array(z.string()),
      expectedOutcome: z.string(),
      risk: z.string()
    }),
    negative: z.object({
      methods: z.array(z.string()),
      useCase: z.string(),
      warning: z.string()
    }),
    ethics: z.string()
  }),
  trainingAdvice: z.object({
    nextObservations: z.array(z.string()),
    validationPlan: z.array(z.string()),
    pitfalls: z.array(z.string())
  }),
  rawAnalysis: z.string().optional()
});

/**
 * 主分析函数
 */
export async function analyzeHuman(input) {
  const validated = InputSchema.parse(input);
  const { targetName, relation, knownFacts, trainingLevel } = validated;

  // 准备事例文本
  const factsText = knownFacts.map((f, i) =>
    `${i+1}. [${f.category}] ${f.description}（置信度：${f.confidence}%）`
  ).join('\n');

  // 根据训练层级调整提示词
  const levelInstructions = {
    level1: `**第一层：缺点分析**
1. 总结能力缺点（至少3个）
2. 总结性格弱点（至少3个）
3. 总结背景缺陷（至少2个）
4. 提炼3-5个核心特征，让人一说就"跃然纸上"`,
    level2: `**第二层：6+2框架**
基于第一层结果，填入以下框架：
1. 家庭条件（经济状况、推断依据）
2. 父母关系（状态、证据、对他影响）
3. 成长经历（阻力大小、教育方式、形成特质）
4. 心理状态（性格类型、情绪模式、稳定性、矛盾点）
5. 思维方式（感性/理性、逻辑能力、思考习惯）
6. 做事方式（时间观念、自我要求、对他人要求、矛盾点）
7. 兴奋点（触发场景、行为表现、利用建议）
8. 脆弱点（触发场景、行为表现、干预方法）`,
    level3: `**第三层：因果链条与干预**
1. 列出外部条件（前3点的综合）
2. 列出自身表现（后3点的综合）
3. 分析作用机制（"如何"造成）
4. 深挖矛盾点（每个矛盾的表象、深层原因、具体事例）
5. 制定干预策略（正向/负向，何时用，伦理提醒）`
  };

  const systemPrompt = `你是"分析人"Skill，一位资深的行为分析专家。训练方法基于微信文章《分析人的训练》的三层递进法。

核心原则：
1. **不是为了准确，而是培养习惯和意识**——准确度在实践中提高
2. **从具体事例出发**——每个结论都要有事实支撑
3. **找"矛盾点"**——表面矛盾处是深层原因的关键
4. **最终为了"干预"**——分析是为了更好应对，不是为了评价

${levelInstructions[trainingLevel]}

⚠️ 输出格式严格要求：
你必须输出严格的JSON格式，不要包含任何markdown标记、解释文字或代码块标记。直接返回纯JSON对象。

JSON结构模板（必须严格遵守）：
{
  "level": "string (必须是: level1, level2, 或 level3)",
  "weaknessAnalysis": {
    "abilityWeaknesses": ["string", "string", "..."],
    "characterWeaknesses": ["string", "string", "..."],
    "backgroundWeaknesses": ["string", "..."],
    "coreTraits": ["string", "string", "..."]
  },
  "sixPlusTwo": {
    "familyBackground": {"economicStatus": "string", "inference": "string", "evidence": ["string", "..."], "confidence": number},
    "parentRelationship": {"status": "string", "evidence": ["string", "..."], "impactOnPerson": "string"},
    "growthExperience": {"resistanceLevel": "string", "educationStyle": "string", "formedTraits": ["string", "..."]},
    "psychology": {"personalityType": "string", "emotionPattern": "string", "stability": "string", "contradictions": ["string", "..."]},
    "thinkingMode": {"primaryMode": "string", "logicAbility": "string", "thinkingHabits": ["string", "..."]},
    "behaviorStyle": {"timeManagement": "string", "selfStandard": "string", "othersStandard": "string", "contradictions": ["string", "..."]},
    "excitementPoints": {"triggerScenes": ["string", "..."], "behaviorWhenExcited": "string", "utilizationAdvice": "string", "confidence": number},
    "vulnerabilityPoints": {"triggerScenes": ["string", "..."], "behaviorWhenDown": "string", "interventionMethods": ["string", "..."], "warning": "string"}
  },
  "causalChain": {
    "externalConditions": ["string", "string", "..."],
    "internalManifestations": ["string", "string", "..."],
    "mechanism": "string",
    "contradictions": [{"surface": "string", "rootCause": "string", "evidence": "string"}]
  },
  "intervention": {
    "positive": {"methods": ["string", "..."], "expectedOutcome": "string", "risk": "string"},
    "negative": {"methods": ["string", "..."], "useCase": "string", "warning": "string"},
    "ethics": "string"
  },
  "trainingAdvice": {
    "nextObservations": ["string", "..."],
    "validationPlan": ["string", "..."],
    "pitfalls": ["string", "..."]
  },
  "rawAnalysis": "string（你的完整分析过程）"
}

重要规则：
1. level必须是字符串"level1"、"level2"或"level3"，不是数字
2. sixPlusTwo的8个字段（familyBackground, parentRelationship等）都必须是对象，不是字符串
3. familyBackground对象必须包含：economicStatus, inference, evidence(数组), confidence(数字)
4. parentRelationship对象必须包含：status, evidence(数组), impactOnPerson
5. causalChain.externalConditions和internalManifestations必须是数组，不是字符串
6. intervention.negative.methods必须是数组
7. trainingAdvice.validationPlan和pitfalls必须是数组
8. 所有数组字段必须是JSON数组格式，即使只有一个元素
9. 不要省略任何字段，所有字段都必须存在（可以用空数组[]或空字符串""填充）
10. 绝对不要输出markdown代码块，只输出纯JSON`;

  const userMessage = `请分析目标人物：${targetName}（${relation}）

观察周期：${validated.observationPeriod}

已知具体事例：
${factsText}

${validated.hypotheses && validated.hypotheses.length > 0 ?
  `我的初步猜测：\n${validated.hypotheses.map((h, i) => `${i+1}. ${h}`).join('\n')}` :
  '暂无初步猜测'}

请按训练层级要求进行完整分析。`;

  // 调试日志
  console.log('🔧 Debug - API_KEY from env:', process.env.STEP_API_KEY ? 'SET' : 'NOT SET');
  console.log('🔧 Debug - API_BASE_URL:', process.env.API_BASE_URL);
  console.log('🔧 Debug - MODEL:', process.env.MODEL);
  console.log('🔧 Debug - openai baseURL:', openai.baseURL);
  console.log('🔧 Debug - openai apiKey:', openai.apiKey ? 'SET' : 'NOT SET');

  // 调用 OpenAI 兼容 API
  console.log('🔧 正在调用 API...');
  const response = await openai.chat.completions.create({
    model: process.env.MODEL || 'gpt-4o',
    max_tokens: 1500,  // 减少 token 数量，加快响应
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7
  });

  const content = response.choices[0].message.content;

  // 保存原始响应用于调试
  console.log('�Raw AI response (first 1000 chars):', content.substring(0, 1000));

  // 提取 JSON（可能被 markdown 代码块包裹）
  let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) {
    jsonMatch = content.match(/\{[\s\S]*\}\}/);
  }
  if (!jsonMatch) {
    jsonMatch = content.match(/\{[\s\S]*\}/);
  }

  if (!jsonMatch) {
    throw new Error('分析结果无法解析为JSON。原始内容：' + content.substring(0, 200));
  }

  const jsonStr = jsonMatch[1] || jsonMatch[0];
  const parsed = JSON.parse(jsonStr);

  // 验证
  const validatedResult = ResultSchema.parse(parsed);

  return {
    success: true,
    target: targetName,
    trainingLevel,
    data: validatedResult
  };
}

// CLI 测试
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const testInput = {
      targetName: "同事A",
      relation: "同部门同事",
      observationPeriod: "3个月",
      trainingLevel: "level2",
      knownFacts: [
        { description: "有私车能出国旅游用得起奢华品牌但不张扬", category: "background", confidence: 85 },
        { description: "从不提父母对不熟的人见外", category: "behavior", confidence: 80 },
        { description: "洁癖形式感强但做事拖拉", category: "behavior", confidence: 90 },
        { description: "喜欢看剧不爱运动饭局多喝酒多", category: "appearance", confidence: 85 },
        { description: "买书但不看说减肥不行动", category: "behavior", confidence: 75 }
      ]
    };

    try {
      const result = await analyzeHuman(testInput);
      console.log('✅ 分析成功！');
      console.log('层级:', result.data.level);
      console.log('核心特征:', result.data.weaknessAnalysis.coreTraits.join(', '));
    } catch (err) {
      console.error('❌ 错误:', err.message);
    }
  })();
}
