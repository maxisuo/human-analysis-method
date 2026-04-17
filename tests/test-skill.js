/**
 * Human Analysis Method Skill - Test Suite
 */

import { analyzeHuman } from '../src/analyzer.js';

const testCases = [
  {
    name: '第一层：缺点分析',
    input: {
      targetName: '同事A',
      relation: '同部门',
      observationPeriod: '3个月',
      trainingLevel: 'level1',
      knownFacts: [
        { description: '工作三年，认识面广但不张扬', category: 'background', confidence: 85 },
        { description: '从不主动找我帮忙，但会帮别人', category: 'behavior', confidence: 90 },
        { description: '办公桌乱了会受不了，有洁癖', category: 'appearance', confidence: 95 },
        { description: '准备金融考试但去年失利', category: 'background', confidence: 80 },
        { description: '在朋友面前活跃，在同事面前沉闷', category: 'behavior', confidence: 90 }
      ]
    }
  },
  {
    name: '第二层：6+2框架',
    input: {
      targetName: '同事A',
      relation: '同部门',
      observationPeriod: '3个月',
      trainingLevel: 'level2',
      knownFacts: [
        { description: '有私车能出国旅游，用得起奢华品牌但不张扬', category: 'background', confidence: 85 },
        { description: '从不提父母，对不熟的人见外', category: 'behavior', confidence: 80 },
        { description: '洁癖、形式感强但做事拖拉', category: 'behavior', confidence: 90 },
        { description: '喜欢看剧不爱运动，饭局多喝酒多', category: 'appearance', confidence: 85 },
        { description: '买书不看，说减肥不行动', category: 'behavior', confidence: 75 }
      ]
    }
  },
  {
    name: '第三层：因果链条与干预',
    input: {
      targetName: '同事A',
      relation: '同部门',
      observationPeriod: '3个月',
      trainingLevel: 'level3',
      knownFacts: [
        { description: '家庭条件好但缺乏冲劲，严谨中有冒失', category: 'background', confidence: 90 },
        { description: '对别人要求高，对自己宽容', category: 'behavior', confidence: 85 },
        { description: '考试失利后回避讨论，怕被比较', category: 'behavior', confidence: 80 },
        { description: '聊牌类游戏时眼睛发亮，谈金融考试时回避', category: 'behavior', confidence: 75 },
        { description: '被赞美专业能力时话变多', category: 'speech', confidence: 80 }
      ]
    }
  }
];

async function runTests() {
  console.log('🧪 开始测试 Human Analysis Method Skill\n');

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    try {
      console.log(`\n📋 ${test.name}...`);
      const result = await analyzeHuman(test.input);

      // 验证输出结构
      if (!result.success) throw new Error('请求失败');
      if (!result.data.weaknessAnalysis) throw new Error('缺少缺点分析');
      if (!result.data.sixPlusTwo) throw new Error('缺少6+2框架');

      console.log('✅ 通过');
      passed++;
    } catch (err) {
      console.error('❌ 失败:', err.message);
      failed++;
    }
  }

  console.log(`\n=============================`);
  console.log(`总计: ${testCases.length} | 通过: ${passed} | 失败: ${failed}`);
  console.log(`=============================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
