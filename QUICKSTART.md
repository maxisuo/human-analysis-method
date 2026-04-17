# Human Analysis Method Skill - Quick Start

## 🚀 30 秒启动

```bash
cd ~/Desktop/human-analysis-method
npm install
cp .env.example .env
# 编辑 .env，填入 ANTHROPIC_API_KEY
npm start
```

浏览器打开：http://localhost:3001

---

## 📂 项目结构

```
human-analysis-method/
├── skill/analysis-method.md     # Skill 定义（三层递进训练法）
├── src/analyzer.js              # Claude 分析引擎 + Zod 验证
├── public/index.html            # 交互式前端（Acid Street 风格）
├── server.js                    # Express API
├── data/records.json            # 训练记录（自动生成）
├── tests/test-skill.js          # 三层测试用例
├── package.json
├── README.md
└── DEPLOY.md
```

---

## 🎮 三种训练层级

### Level 1: 缺点分析
- 训练观察习惯
- 总结能力缺点、性格弱点、背景缺陷
- 提炼3-5个核心特征（一说就跃然纸上）

### Level 2: 6+2 框架
- 家庭条件 → 父母关系 → 成长经历
- 心理状态 → 思维方式 → 做事方式
- + 兴奋点、脆弱点

### Level 3: 因果与干预
- 找矛盾点（表面矛盾 → 深层原因）
- 分析作用机制
- 制定正向/负向干预策略

---

## 📖 使用示例

### 输入（同事A的8个事例）

```
1. [行为] 从不主动找我帮忙，但会帮别人
2. [背景] 工作三年，认识面广但不张扬
3. [外表] 有洁癖，办公桌乱了受不了
4. [背景] 准备金融考试但去年失利
5. [行为] 买书但不看，喜欢看剧
6. [外表] 饭局多喝酒多，偏胖
7. [行为] 朋友面前活跃，同事面前沉闷
8. [背景] 有私车能出国，用品牌但不张扬
```

### 输出（6+2框架摘要）

```
🎯 核心特征：
- 表面严谨实则冒失
- 被动型人格
- 成长阻力小导致冲劲不足

家庭条件：中等偏上（有车、出国）
  ↓ 推断：经济无忧 → 缺乏拼争意识

父母关系：和蔼不亲密
  ↓ 影响：亲密关系中边界感过强

兴奋点：被认可专业能力、聊牌类游戏
脆弱点：考试失利被比较

干预策略：
  ✅ 正向：请教他牌类/金融知识 → 建立良好关系
  ⚠️ 负向：暗示他方法不对 → 竞争时用（慎用）
```

---

## 🔧 API 接口

```bash
# Level 1 分析
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "targetName": "同事A",
    "relation": "同事",
    "trainingLevel": "level1",
    "knownFacts": [
      {"description":"从不主动找我帮忙","category":"behavior","confidence":90},
      ...
    ]
  }'

# Level 2 分析
... trainingLevel: "level2"

# Level 3 分析
... trainingLevel: "level3"
```

---

## 🎯 核心功能

| 功能 | 说明 |
|------|------|
| 三层递进 | 第一层缺点 → 第二层6+2 → 第三层因果干预 |
| 具体事例记录 | 类别标记（行为/言语/背景/外表） |
| 置信度设置 | 每条事例可调可信度 |
| 训练打卡 | 每周7天训练追踪 |
| 示例加载 | 一键加载文章中的同事A案例 |
| 自动保存记录 | 历史分析记录可回溯 |

---

## 🌐 上传 GitHub

```bash
git init
git add .
git commit -m "feat: human analysis method skill based on WeChat article"
git remote add origin https://github.com/<用户名>/human-analysis-method.git
git push -u origin main

# GitHub → Settings → Secrets → Actions
# 添加 ANTHROPIC_API_KEY

# 后端部署（Railway/Render）参考 DEPLOY.md
```

---

## 📚 参考文章

> "分析人的训练" - 微信文章
> 链接：https://mp.weixin.qq.com/s/CzbowSqFaLqlL26ywenaqA

**核心要点**：
1. 分析人是为了干预，不是为了分析
2. 一开始不是为了准确，是培养习惯
3. 从"矛盾点"切入是关键
4. "猜"是必要的训练方法
5. 别分析自己（除了行为复盘）

---

**有问题？查看完整文档：`README.md`**
