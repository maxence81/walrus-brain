# Walrus Brain bot — Fly.io image
FROM node:22-slim

WORKDIR /app

# Install deps first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Bot source (tsx runs TypeScript directly)
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts

# Long-running process: telegram long-polling via tsx
CMD ["npx", "tsx", "src/bot.ts"]
