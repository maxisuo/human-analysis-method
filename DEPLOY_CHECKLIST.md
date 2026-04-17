# 部署准备清单

## 📋 前置检查

### 1. 环境准备
- [ ] Node.js >= 18 已安装（`node -v` 验证）
- [ ] npm >= 9 已安装（`npm -v` 验证）
- [ ] Git 已安装（`git --version` 验证）
- [ ] Anthropic API Key 已获取（https://console.anthropic.com）

### 2. GitHub 仓库准备
- [ ] 在 GitHub 创建新仓库：`human-analysis-method`
- [ ] 复制仓库 HTTPS URL

---

## 🚀 快速部署（3 种方式）

### 方式 A：Railway 网页部署（推荐新手）

**时间**：5 分钟

```
1. 访问 https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. 授权 GitHub，选择 human-analysis-method 仓库
4. 点击 Deploy
5. 等待构建完成（约 2 分钟）
6. Variables → 添加 ANTHROPIC_API_KEY
7. Redeploy
```

**优点**：可视化操作，无需命令行

---

### 方式 B：Railway CLI 自动部署（推荐）

**时间**：3 分钟

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 进入项目目录
cd ~/Desktop/human-analysis-method

# 4. 运行一键部署脚本
./deploy-railway.sh
```

脚本会自动：
- ✅ 初始化 Git（如果未初始化）
- ✅ 推送到 GitHub
- ✅ 创建 Railway 项目
- ✅ 配置环境变量
- ✅ 触发部署

**需要提前准备**：
- GitHub CLI (`gh`) 已安装并登录
- Railway CLI 已登录

---

### 方式 C：GitHub Actions 自动部署

**时间**：一次性配置，后续自动

```bash
# 1. 手动部署一次（用方式 A 或 B）
# 确保服务正常运行

# 2. 在 GitHub 仓库配置 Secrets
# Settings → Secrets and variables → Actions

# 添加以下 Secrets：
RAILWAY_TOKEN       # Railway API Token (Account → API Tokens)
ANTHROPIC_API_KEY   # Claude API Key
RAILWAY_SERVICE_NAME=human-analysis-method

# 3. 推送代码触发自动部署
git add .
git commit -m "feat: add GitHub Actions config"
git push origin main
```

之后每次 `git push` 都会自动部署到 Railway。

---

## 🔧 部署后验证

### 1. 健康检查

```bash
curl https://your-app.railway.app/api/health
```

预期输出：
```json
{
  "status": "ok",
  "service": "human-analysis-method-skill",
  "version": "1.0.0"
}
```

### 2. API 测试

```bash
curl -X POST https://your-app.railway.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "targetName": "测试用户",
    "relation": "同事",
    "trainingLevel": "level1",
    "knownFacts": [
      {"description":"工作认真负责","category":"behavior","confidence":90},
      {"description":"喜欢帮助新人","category":"behavior","confidence":85}
    ]
  }' | jq .
```

预期：返回 JSON 分析结果，`success: true`

---

## 🌐 前端部署（可选）

后端部署在 Railway 后，前端可以：

### 选项 1：Railway 同域名（最简单）

Railway 会自动托管 `public/` 文件夹的静态文件。

访问：`https://your-app.railway.app/` 即可直接使用。

**无需额外配置** ✅

---

### 选项 2：GitHub Pages 独立部署（速度更快）

GitHub Pages 全球 CDN，访问更快：

```bash
# 1. 创建 gh-pages 分支
git checkout --orphan gh-pages
git --work-tree public add --all
git --work-tree public commit -m "frontend deployment"
git push origin gh-pages --force
git checkout main

# 2. GitHub 设置
# Settings → Pages
# Source: Deploy from a branch → gh-pages → Save
```

访问：`https://<用户名>.github.io/human-analysis-method/`

**注意**：需要在 `public/index.html` 中修改 API 地址为 Railway URL。

---

### 选项 3：Vercel 部署前端

```bash
cd public
vercel --prod
```

Vercel 自动分配域名，速度极快。

---

## 🎯 各项目集成步骤

### PM Helper 集成

**文件位置**：`~/Desktop/pm-helper/`

**修改文件**：`popup.js`

```javascript
// 添加 Skill API 配置
const SKILL_API = 'https://human-analysis-method.up.railway.app/api/analyze';

// 在生成需求文档前调用
async function generateWithAnalysis() {
  const colleague = prompt('请输入同事姓名/特征（可选）');
  let analysis = null;

  if (colleague) {
    analysis = await callSkillAPI(colleague);
    applyAnalysisToPrompt(analysis);  // 根据分析调整 Prompt
  }

  const prompt = buildPrompt(requirements, analysis);
  copyToClipboard(prompt);
}
```

---

### Prompt Input Method 集成

**文件位置**：`~/Desktop/prompt-input-method/`

**修改文件**：`renderer/index.html` + `renderer/app.js`

添加侧边栏"目标分析"模块（参考前文）。

---

### OpenClaw MCP 集成

创建 `openclaw-human-analysis/` 插件目录，实现 MCP Server。

---

## 📊 成本估算

| 服务 | 免费额度 | 预计月费用 |
|------|---------|-----------|
| Railway（后端） | $5 信用（~500 小时） | $0（个人使用足够） |
| GitHub Pages（前端） | 完全免费 | $0 |
| Anthropic API | 按次计费 | ~$0.03/次（Sonnet） |
| **总计** | - | **$0-$2/月** |

---

## 🔄 更新部署

### 更新代码后

```bash
git add .
git commit -m "feat: 新增兴奋点验证功能"
git push origin main
```

GitHub Actions 会自动部署（如果配置了）。

### 手动触发

Railway 控制台 → 项目 → Deployments → Trigger New Deployment

---

## 🐛 故障排除

### 问题 1：部署失败，提示 Node 版本

**解决**：在 `package.json` 添加：
```json
{
  "engines": {
    "node": ">=18"
  }
}
```

### 问题 2：ANTHROPIC_API_KEY 错误

**解决**：
1. 去 Anthropic Console 重新生成 Key
2. Railway → Variables → 更新值
3. Redeploy

### 问题 3：CORS 跨域错误

**解决**：在 `server.js` 修改 CORS 配置：
```javascript
app.use(cors({
  origin: ['https://your-frontend.com', 'chrome-extension://...'],
  credentials: true
}));
```

### 问题 4：前端请求 404

**原因**：前端 API 地址还是 `/api/analyze`（相对路径），但前后端不同域名。

**解决**：修改 `public/index.html` 第 551 行为完整 URL。

---

## 📞 需要帮助？

- Railway 文档：https://docs.railway.app
- 查看日志：Railway → Logs
- 本地测试：`npm start` → `curl http://localhost:3001/api/health`

---

**现在就开始部署吧！** 🚀

完成后告诉我，我来帮你集成到具体项目中。
