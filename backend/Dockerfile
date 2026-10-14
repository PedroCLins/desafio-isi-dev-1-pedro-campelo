FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN pnpm install

COPY . .
RUN npx prisma contract emit
RUN npx prisma db update
RUN pnpm build

EXPOSE 5000

CMD ["pnpm", "run", "dev"]