FROM node:20-alpine

RUN apk add --no-cache \
    linux-headers \
    udev \
    dmidecode \
    util-linux \
    lm-sensors

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY . .

CMD ["node", "app.js"]