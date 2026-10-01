FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json tsconfig*.json vite.config.ts ./
RUN npm ci

COPY public ./public
COPY src ./src
COPY index.html ./
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
