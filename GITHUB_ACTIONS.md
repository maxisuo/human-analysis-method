# Human Analysis Method Skill - GitHub Actions 自动部署

自动部署到 Railway + GitHub Pages（前端）。

## 配置步骤

### 1. 添加 Secrets

在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：

| Secret Name | Value | 说明 |
|-------------|-------|------|
| `ANTHROPIC_API_KEY` | 你的 Claude API Key | 后端 API 调用 |
| `RAILWAY_TOKEN` | Railway API Token | 自动部署 Railway |
| `RAILWAY_SERVICE_NAME` | `human-analysis-method` | 服务名 |

**获取 Railway Token**：
1. Railway → Account → API Tokens
2. New Token → 复制

---

### 2. GitHub Actions 工作流

本仓库已包含 `.github/workflows/deploy.yml`，包含：

- **on push to main** → 自动部署到 Railway
- **on workflow_dispatch** → 手动触发部署

---

## 手动触发部署

在 GitHub 仓库：
1. Actions 标签
2. 选择 "Deploy to Railway"
3. Click "Run workflow"

---

## 前端独立部署（GitHub Pages）

由于 Railway 主要托管后端，前端建议用 GitHub Pages：

### 方法 A：GitHub Pages（推荐）

```bash
# 1. 创建 docs 分支或使用 gh-pages
git checkout --orphan gh-pages
git --work-tree public add --all
git --work-tree public commit -m "frontend deployment"
git push origin gh-pages --force

# 2. GitHub 仓库 → Settings → Pages
# Source: Deploy from a branch
# Branch: gh-pages, folder: / (root)
```

访问：`https://<用户名>.github.io/human-analysis-method/`

### 方法 B：Vercel 部署前端

```bash
cd public
vercel --prod
```

然后在 `public/index.html` 中修改 API 地址为你 Railway 后端 URL。

---

## 环境变量说明

### Railway 后端环境变量

```bash
ANTHROPIC_API_KEY  # 必填 - Claude API Key
NODE_ENV=production
PORT=3001
```

### GitHub Pages 前端配置

前端需要知道后端地址，修改 `public/index.html`：

```javascript
// Line ~551
const res = await fetch('https://your-app.up.railway.app/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... })
});
```

**环境变量注入（高级）**：
使用 GitHub Actions 在部署时替换占位符：

```yaml
- name: Replace API URL
  run: |
    sed -i "s|https://your-app.up.railway.app|${{ secrets.RAILWAY_URL }}|g" public/index.html
```

---

## 自定义域名

### Railway 后端

Railway → Project → Settings → Domains → Add Domain

### GitHub Pages 前端

GitHub → Repository → Settings → Pages → Custom domain

---

## 监控与日志

### Railway 日志

```bash
# 实时日志
railway log

# 查看最近部署
railway status
```

### GitHub Actions 日志

GitHub → Actions → 选择 workflow → 查看步骤日志

---

## 故障排除

### 部署失败：`npm ci` error

检查 `package.json` 版本兼容性，确保 Node 版本 >= 18。

### API 返回 500

查看 Railway Logs，常见原因：
- `ANTHROPIC_API_KEY` 无效
- Claude API 配额用尽

### 前端无法访问后端

CORS 问题：在 `server.js` 中添加：
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

---

## 成本估算

| 平台 | 免费额度 | 超出费用 |
|------|---------|---------|
| Railway | $5/月 (~500小时) | $0.000031/GB-sec |
| GitHub Pages | 完全免费 | - |
| Anthropic API | 按调用计费 | ~$0.03/次 (Sonnet) |

---

## 更新部署

后续更新代码后：

```bash
git add .
git commit -m "fix: 修复某个问题"
git push origin main
# GitHub Actions 会自动触发 Railway 部署
```

等待几分钟，访问 Railway 域名验证更新。

---

**需要我帮你：**
1. 初始化 Git 并推送到 GitHub？
2. 配置 Railway CLI 本地部署测试？
3. 设置 GitHub Pages 前端部署？
