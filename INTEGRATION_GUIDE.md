# Human Analysis Skill - 项目集成总览

## 📦 已创建的集成文件

### 1. 核心 Skill 服务
```
human-analysis-method/
├── railway.toml              # Railway 配置文件
├── deploy-railway.sh         # 一键部署脚本
├── .github/workflows/deploy.yml  # GitHub Actions 自动部署
├── RAILWAY_DEPLOY.md         # Railway 详细部署指南
├── GITHUB_ACTIONS.md         # GitHub Actions 配置指南
└── DEPLOY_CHECKLIST.md       # 部署检查清单
```

### 2. PM Helper 集成
```
pm-helper/
└── integrations/
    └── human-analysis-integration.js   # 需求转换时分析同事
```

**功能**：
- 在生成技术方案前，选择目标执行人
- 调用 Skill API 获取该同事的兴奋点/脆弱点
- 自动调整 Prompt 话术（比如对重视技术的人强调挑战，对怕 deadline 的人建议分阶段）

**使用方法**：
```javascript
import { generateTailoredPrompt } from './integrations/human-analysis-integration.js';

const result = await generateTailoredPrompt(
  '用户头像上传功能',
  '张工'  // 后端同事
);
// result.prompt 已是针对张工优化的 Prompt
// result.tips 提供沟通建议
```

---

### 3. Prompt Input Method 集成
```
prompt-input-method/
└── integrations/
    └── human-analysis-integration.js   # 优化 Prompt 表达
```

**功能**：
- 在输入 Prompt 时，侧边栏分析目标受众（老板/客户/同事）
- 实时给出优化建议（"这样说他会开心" / "避免这样说"）
- 根据分析结果自动重写 Prompt

**使用方法**：
```javascript
// 在 renderer/index.html 添加侧边栏模块
// 在 renderer/app.js 调用：
analyzeTargetAndOptimize();  // 分析并优化当前 Prompt
```

---

### 4. TTS Server 集成（待实现）
```
tts/
└── (待添加)  /api/analyze-and-speak   # 分析 + 语音合成
```

**功能**：
- 调用 Skill 分析后，将结果转为语音
- 适合开会前快速复习、训练时听示范

---

### 5. OpenClaw MCP 集成（待实现）
```
openclaw-human-analysis/
├── skill.md              # MCP Skill 定义
└── server.js             # MCP Server 实现
```

**功能**：
- 在 Claude Code 中直接调用
- 对话式分析：`/analyze 同事A，特点：xxx`

---

## 🚀 立即开始部署

### 第一步：快速测试（本地）

```bash
cd ~/Desktop/human-analysis-method
npm install
cp .env.example .env
# 编辑 .env，填入 ANTHROPIC_API_KEY

# 启动服务
npm start
```

访问 http://localhost:3001，点击"加载示例"查看文章案例。

---

### 第二步：部署到 Railway（推荐方式 A）

**方式 A：网页一键部署（最简单）**

1. 访问 https://railway.app
2. New Project → Deploy from GitHub
3. 选择 `human-analysis-method` 仓库
4. 点击 Deploy
5. Variables → 添加 `ANTHROPIC_API_KEY`
6. Redeploy

**方式 B：命令行自动部署**

```bash
cd ~/Desktop/human-analysis-method

# 安装 Railway CLI
npm install -g @railway/cli
railway login

# 运行一键脚本
./deploy-railway.sh
```

脚本会自动处理 Git、GitHub、Railway 所有步骤。

---

### 第三步：配置 GitHub Actions（自动部署）

1. GitHub 仓库 → Settings → Secrets
2. 添加：
   - `RAILWAY_TOKEN`（Railway → Account → API Tokens）
   - `ANTHROPIC_API_KEY`
3. 推送代码触发自动部署

---

### 第四步：前端地址更新

如果前后端不同域名：

1. 编辑 `public/index.html`
2. 第 551 行，将 `/api/analyze` 改为完整 URL：
   ```javascript
   const res = await fetch('https://your-app.railway.app/api/analyze', { ... });
   ```
3. 重新提交部署

---

### 第五步：集成到具体项目

#### PM Helper 集成

```bash
cd ~/Desktop/pm-helper
# 复制集成文件
cp ../human-analysis-method/integrations/pm-helper/* integrations/
# 在 popup.js 中引入并使用
```

详细代码：`human-analysis-method/integrations/pm-helper/`（可单独创建）

#### Prompt IM 集成

```bash
cd ~/Desktop/prompt-input-method
# 在 renderer/index.html 添加侧边栏模块
# 在 app.js 中调用 integration 代码
```

参考：`human-analysis-method/integrations/prompt-im/`

---

## 📊 部署状态追踪

| 步骤 | 状态 | 说明 |
|------|------|------|
| 1. 本地测试 | ⏳ | `npm start` → http://localhost:3001 |
| 2. Git 初始化 | ⏳ | `git init && git push` |
| 3. Railway 部署 | ⏳ | 网页或 CLI 部署 |
| 4. 环境变量配置 | ⏳ | ANTHROPIC_API_KEY |
| 5. 健康检查 | ⏳ | `curl /api/health` |
| 6. API 测试 | ⏳ | `curl /api/analyze` |
| 7. 前端地址更新 | ⏳ | 修改 fetch URL |
| 8. PM Helper 集成 | ⏳ | 调用 Skill API |
| 9. Prompt IM 集成 | ⏳ | 侧边栏分析模块 |
| 10. 监控日志 | ⏳ | Railway Logs |

---

## 🆘 故障排除

### 问题：本地运行报错 `Cannot find module '@anthropic-ai/sdk'`

```bash
npm install @anthropic-ai/sdk
```

### 问题：Railway 部署失败，提示 `node: command not found`

Railway 默认使用 Nixpacks，确保 `package.json` 中 `type: "module"` 正确。

### 问题：API 返回 401

检查 `ANTHROPIC_API_KEY` 是否正确且未过期。

### 问题：前端跨域

在 `server.js` 中：
```javascript
app.use(cors({
  origin: ['https://your-frontend.com'],
  credentials: true
}));
```

---

## 🎯 下一步

1. **先本地运行**：确认 `npm start` 正常
2. **选择部署方式**：网页（A）或 CLI（B）
3. **推送 GitHub**：代码备份
4. **Railway 部署**：5 分钟完成
5. **告诉我结果**：遇到问题随时问我

**你现在想先做哪一步？**

我可以：
- 帮你运行本地测试（确认代码无问题）
- 初始化 Git 并推送到 GitHub（需要你提供仓库 URL）
- 远程协助 Railway 部署（需要你共享屏幕或给我账号）
- 直接修改 PM Helper 代码集成
