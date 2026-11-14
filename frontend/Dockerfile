# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@10

# Copiar definicions de workspace i dependències per a builds reproduïbles
COPY pnpm-lock.yaml* pnpm-workspace.yaml* package.json .npmrc* ./
COPY frontend/package.json ./frontend/

# Instal·lar dependències
RUN pnpm install

# Copiar codi font de frontend i compilar
COPY frontend ./frontend
RUN pnpm --filter yule-frontend build

# Serve stage amb nginx
FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
