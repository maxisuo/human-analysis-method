import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeHuman } from './src/analyzer.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

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

// 保存训练记录（完整版）
app.post('/api/save-record', (req, res) => {
  const {
    sessionId,
    targetName,
    relation,
    trainingLevel,
    observationPeriod,
    knownFacts,
    hypotheses,
    analysis,  // 完整的分析结果
    date
  } = req.body;

  if (!sessionId || !targetName || !analysis) {
    return res.status(400).json({
      success: false,
      error: '缺少必要字段: sessionId, targetName, analysis'
    });
  }

  const recordsPath = join(__dirname, 'data', 'records.json');

  let records = [];
  if (existsSync(recordsPath)) {
    records = JSON.parse(readFileSync(recordsPath, 'utf-8'));
  }

  const newRecord = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    sessionId,
    targetName,
    relation: relation || '',
    trainingLevel: trainingLevel || 'level1',
    observationPeriod: observationPeriod || '',
    knownFacts: knownFacts || [],
    hypotheses: hypotheses || [],
    analysis,
    date: date || new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  };

  records.push(newRecord);

  // 保持每个 session 最多 100 条，全局最多 1000 条
  const sessionRecords = records.filter(r => r.sessionId === sessionId);
  if (sessionRecords.length > 100) {
    const excess = sessionRecords.slice(0, sessionRecords.length - 100);
    const excessIds = excess.map(r => r.id);
    records = records.filter(r => !excessIds.includes(r.id));
  }
  if (records.length > 1000) {
    records = records.slice(-1000);
  }

  writeFileSync(recordsPath, JSON.stringify(records, null, 2));
  res.json({ success: true, id: newRecord.id });
});

// 获取训练记录（按 sessionId 过滤）
app.get('/api/records', (req, res) => {
  const { sessionId } = req.query;
  const recordsPath = join(__dirname, 'data', 'records.json');

  if (!existsSync(recordsPath)) {
    return res.json([]);
  }

  let records = JSON.parse(readFileSync(recordsPath, 'utf-8'));

  // 按 sessionId 过滤
  if (sessionId) {
    records = records.filter(r => r.sessionId === sessionId);
  }

  // 按更新时间倒序
  records.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  res.json(records);
});

// 删除记录
app.delete('/api/records/:id', (req, res) => {
  const { id } = req.params;
  const recordsPath = join(__dirname, 'data', 'records.json');

  if (!existsSync(recordsPath)) {
    return res.status(404).json({ success: false, error: '记录不存在' });
  }

  let records = JSON.parse(readFileSync(recordsPath, 'utf-8'));
  const initialLength = records.length;
  records = records.filter(r => r.id !== id);

  if (records.length === initialLength) {
    return res.status(404).json({ success: false, error: '记录不存在' });
  }

  writeFileSync(recordsPath, JSON.stringify(records, null, 2));
  res.json({ success: true });
});

// 获取单条记录详情
app.get('/api/records/:id', (req, res) => {
  const { id } = req.params;
  const recordsPath = join(__dirname, 'data', 'records.json');

  if (!existsSync(recordsPath)) {
    return res.status(404).json({ success: false, error: '记录不存在' });
  }

  const records = JSON.parse(readFileSync(recordsPath, 'utf-8'));
  const record = records.find(r => r.id === id);

  if (!record) {
    return res.status(404).json({ success: false, error: '记录不存在' });
  }

  res.json(record);
});

app.listen(PORT, () => {
  console.log(`
🚀 Human Analysis Method Skill 启动成功
📊 API: http://localhost:${PORT}/api/analyze
🌐 前端: http://localhost:${PORT}/
📚 训练层级: 第一层(缺点) → 第二层(6+2) → 第三层(因果干预)
  `);
});
