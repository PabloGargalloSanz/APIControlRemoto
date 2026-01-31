FROM node:18-alpine

# instalar dependencias systeminformation
RUN apk add --no-cache \
    linux-headers \
    udev \
    dmidecode \
    util-linux \
    lm-sensors

WORKDIR /app

# copiamos dependencias e instalamos
COPY package*.json ./
RUN npm install

# copiamos todo el coigo fuente
COPY . .

# comando por defecto 
CMD ["node", "app.js"]