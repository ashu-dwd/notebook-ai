# Use the latest LTS version of Node.js as the base image
FROM oven/bun:latest AS base

# Set the working directory
WORKDIR /app

# --- Frontend Stage ---
FROM base AS frontend

WORKDIR /app/client

# Copy package.json and bun.lock to avoid re-installing dependencies if they haven't changed
COPY client/package.json client/bun.lock ./

# Install dependencies
RUN bun install

# Copy the frontend source code
COPY client/src ./src
COPY client/public ./public
COPY client/index.html ./

# Build the frontend
RUN bun run build

# --- Backend Stage ---
FROM base AS backend

WORKDIR /app/server

# Copy package.json and bun.lock to avoid re-installing dependencies if they haven't changed
COPY server/package.json server/bun.lock ./

# Install dependencies
RUN bun install

# Copy the backend source code
COPY server/src ./src
COPY server/config ./config
COPY server/server.js ./

# Build the backend - if applicable
# RUN bun run build

# Expose the backend port
EXPOSE 3000

# --- Final Stage ---
FROM nginx:alpine AS final

# Copy the built frontend from the frontend stage
COPY --from=frontend /app/client/dist /usr/share/nginx/html

# Copy the backend from the backend stage
COPY --from=backend /app/server /app/server

# Copy nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start the backend server
CMD ["node", "/app/server/server.js"]