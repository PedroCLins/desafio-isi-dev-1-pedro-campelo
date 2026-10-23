FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

RUN pnpm prisma contract emit
RUN pnpm build

EXPOSE 3001

CMD ["sh", "-c", "pnpm prisma db update && pnpm run dev"]