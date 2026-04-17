#!/bin/bash

# Human Analysis Method Skill - Railway 一键部署脚本
# 使用前请确保：
# 1. 已安装 GitHub CLI (gh)
# 2. 已登录 Railway CLI (railway login)
# 3. 已有 Anthropic API Key

set -e  # 遇到错误立即退出

echo "================================"
echo "🚀 Human Analysis Method Skill"
echo "   Railway 自动部署脚本"
echo "================================"
echo ""

# 检查依赖
command -v gh >/dev/null 2>&1 || { echo "❌ 请先安装 GitHub CLI: https://cli.github.com"; exit 1; }
command -v railway >/dev/null 2>&1 || { echo "❌ 请先安装 Railway CLI: npm i -g @railway/cli"; exit 1; }

# 1. 读取 API Key
echo "请输入你的 Anthropic API Key："
read -s ANTHROPIC_API_KEY
echo ""

# 2. 初始化 Git（如果还没）
if [ ! -d ".git" ]; then
  echo "📦 初始化 Git 仓库..."
  git init
  git add .
  git commit -m "feat: initial commit - human analysis method skill"
else
  echo "✅ Git 仓库已存在"
fi

# 3. 检查远程仓库
REMOTE_EXISTS=$(git remote | grep -c origin || true)
if [ "$REMOTE_EXISTS" -eq 0 ]; then
  echo "请创建 GitHub 仓库后按回车..."
  read

  echo "🔗 关联 GitHub 仓库..."
  git remote add origin $(gh repo view --json nameWithOwner -q .nameWithOwner)
else
  echo "✅ 远程仓库已配置"
fi

# 4. 推送到 GitHub
echo "📤 推送到 GitHub..."
git push -u origin main

# 5. 等待 Railway 初始化
echo "⏳ 等待 Railway 项目初始化..."
sleep 3

# 6. 创建 Railway 项目（如果不存在）
echo "🚂 在 Railway 上创建项目..."
railway link $(gh repo view --json nameWithOwner -q .nameWithOwner) || true

# 7. 设置环境变量
echo "🔐 配置环境变量..."
railway variables set ANTHROPIC_API_KEY "$ANTHROPIC_API_KEY"
railway variables set NODE_ENV production
railway variables set PORT 3001

# 8. 触发部署
echo "🚀 触发部署..."
railway up

echo ""
echo "================================"
echo "✅ 部署完成！"
echo ""
echo "📊 服务地址：railway url 查看"
echo "🌐 前端地址：将 public/ 部署到 GitHub Pages"
echo "📚 文档：RAILWAY_DEPLOY.md"
echo "================================"
