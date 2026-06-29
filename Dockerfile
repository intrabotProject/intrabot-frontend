FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_GATEWAY_URL=http://localhost:8000
ENV NEXT_PUBLIC_GATEWAY_URL=$NEXT_PUBLIC_GATEWAY_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN mkdir -p public
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
