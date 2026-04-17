FROM node:20-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖（使用 /tmp 作为 npm 缓存，避免与挂载点冲突）
RUN npm config set cache /tmp/.npm && npm ci --omit=dev

# 复制源码
COPY . .

# 启动命令
CMD ["npm", "start"]
