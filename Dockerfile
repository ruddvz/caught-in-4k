# C4K Live Node 20.x
# the node version for running C4K Live
ARG NODE_VERSION=20-alpine
FROM node:$NODE_VERSION AS base

# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN apk add --no-cache git

# Meta
LABEL Description="C4K Live" Vendor="Smart Code OOD" Version="1.0.0"

RUN mkdir -p /var/www/c4k-live
WORKDIR /var/www/c4k-live

# Setup app
FROM base AS app

COPY package.json pnpm-lock.yaml /var/www/c4k-live
RUN pnpm i --frozen-lockfile

COPY . /var/www/c4k-live
RUN pnpm build

# Setup server
FROM base AS server

RUN pnpm i express@4

# Finalize
FROM base

COPY http_server.js /var/www/c4k-live
COPY --from=server /var/www/c4k-live/node_modules /var/www/c4k-live/node_modules
COPY --from=app /var/www/c4k-live/build /var/www/c4k-live/build

EXPOSE 8080
CMD ["node", "http_server.js"]
