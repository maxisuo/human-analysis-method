import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeHuman } from './src/analyzer.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'human-analysis-method-skill',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 分析接口
app.post('/api/analyze', async (req, res) => {
  try {
    const result = await analyzeHuman(req.body);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '分析失败'
    });
  }
});

// Skill 元数据
app.get('/api/skill', (req, res) => {
  res.json({
    name: 'human-analysis-method',
    description: '三层递进训练法：1)缺点分析 2)6+2框架 3)因果链条与干预',
    version: '1.0.0',
    levels: ['level1', 'level2', 'level3'],
    inputSchema: {
      targetName: '目标姓名',
      relation: '关系',
      knownFacts: '至少5个具体事例（描述、类别、置信度）',
      trainingLevel: '训练层级：level1/level2/level3'
    },
    outputSchema: {
      weaknessAnalysis: '缺点、弱点、缺陷、核心特征',
      sixPlusTwo: '8个维度的系统分析',
      causalChain: '外部条件→自身表现的因果链条',
      intervention: '正向/负向干预策略',
      trainingAdvice: '下一步训练建议'
    }
  });
});

// 保存训练记录（可选）
app.post('/api/save-record', (req, res) => {
  const { targetName, analysis, date } = req.body;
  const recordsPath = join(__dirname, 'data', 'records.json');

  let records = [];
  if (existsSync(recordsPath)) {
    records = JSON.parse(readFileSync(recordsPath, 'utf-8'));
  }

  records.push({
    id: Date.now(),
    targetName,
    date: date || new Date().toISOString().split('T')[0],
    analysis
  });

  // 保持最近100条
  records = records.slice(-100);

  writeFileSync(recordsPath, JSON.stringify(records, null, 2));
  res.json({ success: true, id: records[records.length-1].id });
});

// 获取训练记录
app.get('/api/records', (req, res) => {
  const recordsPath = join(__dirname, 'data', 'records.json');
  if (existsSync(recordsPath)) {
    const records = JSON.parse(readFileSync(recordsPath, 'utf-8'));
    res.json(records);
  } else {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`
🚀 Human Analysis Method Skill 启动成功
📊 API: http://localhost:${PORT}/api/analyze
🌐 前端: http://localhost:${PORT}/
📚 训练层级: 第一层(缺点) → 第二层(6+2) → 第三层(因果干预)
  `);
});
