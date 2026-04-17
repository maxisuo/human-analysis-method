# Human Analysis Method Skill - Railway 部署指南

## 🚀 Railway 一键部署（5分钟）

### 前置条件

1. **GitHub 账号** — 代码已推送到仓库
2. **Railway 账号** — 免费注册 https://railway.app
3. **Anthropic API Key** — 已准备好

---

## 步骤 1：推送代码到 GitHub

```bash
cd ~/Desktop/human-analysis-method

# 初始化 Git（如果还没做）
git init
git add .
git commit -m "feat: human analysis method skill based on WeChat article"

# 创建 GitHub 仓库（网页端）
# 仓库名：human-analysis-method（建议私有，因为 Skill 定义文件）

# 关联远程仓库
git remote add origin https://github.com/<你的用户名>/human-analysis-method.git
git branch -M main
git push -u origin main
```

---

## 步骤 2：在 Railway 创建项目

1. 登录 [Railway](https://railway.app)
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 授权 Railway 访问你的 GitHub
5. 选择仓库：`human-analysis-method`
6. 点击 **"Deploy"**

Railway 会自动：
- 检测到 Node.js 项目
- 运行 `npm ci --only=production`
- 启动 `npm start`

---

## 步骤 3：配置环境变量

部署完成后（或部署前），添加环境变量：

1. 在 Railway 项目页面，点击 **"Variables"** 标签
2. 点击 **"Add Variable"**
3. 添加：

| Key | Value | 说明 |
|-----|-------|------|
| `ANTHROPIC_API_KEY` | 你的 Claude API Key | **必填** |
| `NODE_ENV` | `production` | 自动设置 |
| `PORT` | `3001` | 自动设置 |

4. 保存变量
5. **触发重新部署**（Variables 页面有 "Redeploy" 按钮）

---

## 步骤 4：获取服务 URL

部署成功后，Railway 会分配一个域名，格式：
```
https://human-analysis-method-production-<随机ID>.railway.app
```

在 Railway 项目页面的 **"Settings"** 中：
1. 找到 **"Domains"** 标签
2. 复制主域名（或自定义域名）

---

## 步骤 5：验证部署

```bash
# 健康检查
curl https://your-app.railway.app/api/health

# 测试分析接口
curl -X POST https://your-app.railway.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "targetName": "测试",
    "relation": "同事",
    "trainingLevel": "level1",
    "knownFacts": [
      {"description":"工作认真","category":"behavior","confidence":80},
      {"description":"喜欢帮助人","category":"behavior","confidence":85},
      {"description":"按时上班","category":"behavior","confidence":90}
    ]
  }'
```

预期返回：
```json
{
  "success": true,
  "data": {
    "level": "第一层：缺点分析",
    "weaknessAnalysis": { ... },
    ...
  }
}
```

---

## 步骤 6：更新前端 API 地址（重要！）

如果前端和后端**部署在不同域名**（Railway 后端 + GitHub Pages 前端）：

1. 编辑 `public/index.html`
2. 找到第 551 行附近的 fetch 调用：
   ```javascript
   const res = await fetch('/api/analyze', { ... });
   ```
3. 改为完整 URL：
   ```javascript
   const res = await fetch('https://your-app.railway.app/api/analyze', {
     // ... 其他配置
   });
   ```
4. 重新部署前端（Git 提交并推送）

**如果前后端同域名**（Railway 自动处理），无需修改。

---

## 步骤 7：设置 GitHub Actions 自动部署（可选）

Railway 支持自动部署：

1. Railway 项目 → **"Settings"** → **"Deployments"**
2. 开启 **"Auto Deploy"**
3. 选择触发分支（推荐 `main`）

之后每次 `git push` 都会自动重新部署。

---

## 常见问题

### ❌ 部署失败：`ANTHROPIC_API_KEY not set`

**解决**：
1. Railway → Variables → 确认 `ANTHROPIC_API_KEY` 已添加
2.  Redeploy 一次

---

### ❌ 端口错误：`Port 3001 not listening`

**解决**：
Railway 使用动态端口，修改 `server.js` 第 115 行：

```javascript
const PORT = process.env.PORT || 3001;  //  Railway 会自动注入 PORT
```

---

### ❌ 数据库持久化问题

`data/records.json` 在 Railway 的容器重启后会丢失。

**解决方案 A（临时）**：忽略记录持久化，每次重启清空（适合测试）

**解决方案 B（推荐）**：使用 Railway 的 **Volumes**（付费功能）

**解决方案 C（免费）**：连接外部数据库（如 Supabase/Firebase）存储记录，需要修改 `server.js` 的 `/api/save-record` 和 `/api/records` 接口。

---

### ❌ CORS 跨域错误

如果前端域名与后端不同，需要在 `server.js` 中配置 CORS：

```javascript
app.use(cors({
  origin: [
    'https://<你的用户名>.github.io',
    'https://human-analysis-method-<你的用户名>.vercel.app'
  ],
  credentials: true
}));
```

---

## 成本

**Railway 免费额度**（每月）：
- $5 信用额度（约 500 小时运行时间）
- 足够个人使用

**注意**：免费实例会**休眠**（30分钟无请求后），首次访问需等待唤醒（~5秒）。

---

## 下一步

部署完成后，你可以：

1. **前端独立部署**：将 `public/` 文件夹部署到 GitHub Pages
2. **集成到其他项目**：在 PM Helper 等项目中调用 API
3. **添加自定义域名**：Railway → Settings → Domains
4. **监控日志**：Railway → Logs 标签查看实时日志

---

## 文件说明

```
human-analysis-method/
├── railway.toml        ← Railway 配置文件（已创建）
├── server.js           ← Express 服务（已适配 Railway）
├── public/index.html   ← 前端界面
├── src/analyzer.js     ← Claude 分析引擎
└── package.json        ← 依赖清单
```

---

**遇到问题？**
- Railway 文档：https://docs.railway.app
- 查看日志：Railway 控制台 → Logs
- 本地测试：`npm start` 确保本地能跑通

**开始部署吧！** 🚀
