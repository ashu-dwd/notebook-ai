# Use Bun official image
FROM oven/bun:1 as base

# Set working directory
WORKDIR /app

# Copy only server package files first (for caching)
COPY server/package.json server/bun.lock ./

# Install only production dependencies
RUN bun install --production --frozen-lockfile --prebuilt

# Copy the rest of the server source code
COPY server/ ./

# Expose port
EXPOSE 8080

# Start the server
CMD ["bun", "start"]
