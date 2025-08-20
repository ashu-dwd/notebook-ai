# Use a Node.js LTS version as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g bun

# Copy only server package files first (for caching)
COPY server/package.json server/bun.lock ./

# Install only production dependencies
RUN bun install --prod

# Copy the rest of the server source code
COPY server/ ./

# Expose port
EXPOSE 8080

# Start command
CMD ["bun", "start"]
