ARG BUILD_FROM
FROM $BUILD_FROM

RUN apk add --no-cache nodejs npm

COPY rootfs /

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./

COPY src ./src

RUN npm run build