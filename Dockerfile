# --- Builder Stage ---
FROM node:18-alpine AS builder

# Install Bun
RUN apk add --no-cache curl bash \
    && curl -fsSL https://bun.sh/install | bash \
    && mv /root/.bun/bin/bun /usr/local/bin/

WORKDIR /app

# Copy only package files first
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies for server & client
RUN cd server && bun install
RUN cd client && bun install

# Copy the rest of the source
COPY server ./server
COPY client ./client

# Build frontend
RUN cd client && bun run build

# --- Final Stage ---
FROM node:18-alpine

# Install Bun in final stage
RUN apk add --no-cache curl bash \
    && curl -fsSL https://bun.sh/install | bash \
    && mv /root/.bun/bin/bun /usr/local/bin/

WORKDIR /app

# Copy frontend build
COPY --from=builder /app/client/dist ./public

# Copy backend
COPY --from=builder /app/server ./server

WORKDIR /app/server
EXPOSE 8080

# Start backend
CMD ["node", "server.js"]
