# Use a Node.js LTS version as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only server package files first (for caching)
COPY server/package.json server/pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod

# Copy the rest of the server source code
COPY server/ ./

# Expose port
EXPOSE 8080

# Start command
CMD ["pnpm", "start"]
