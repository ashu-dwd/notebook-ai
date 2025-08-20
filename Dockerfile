FROM oven/bun:1 as base

WORKDIR /app

# Add python + build deps
RUN apk add --no-cache python3 make g++ 

COPY server/package.json server/bun.lock ./

RUN bun install --production --frozen-lockfile

COPY server/ ./

EXPOSE 8080

CMD ["bun", "start"]
