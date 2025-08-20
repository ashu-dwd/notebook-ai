# Use a Node.js LTS version as the base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g bun

# Copy only server package files first (for caching)
COPY server/package.json server/bun.lock ./server/
COPY client/package.json client/bun.lock ./client/

# Install only production dependencies
RUN bun install

# Copy the rest of the server source code
COPY server/ ./server/
COPY client/ ./client/

# Build the React application
RUN cd client && bun run build

# Use a Node.js LTS version as the base image for the production image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy the built React application from the builder image
COPY --from=builder /app/client/dist ./public

# Copy the server application from the builder image
COPY --from=builder /app/server .

# Expose port
EXPOSE 8080

# Start command
CMD ["bun", "server.js"]

