FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx tsc --outDir dist --module nodenext --moduleResolution nodenext \
      --target es2022 --esModuleInterop true --skipLibCheck true \
      index.ts db.ts 2>/dev/null || true
RUN npx tsx --version > /dev/null

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npx", "tsx", "index.ts"]
