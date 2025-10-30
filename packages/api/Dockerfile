## Simple, production-ready Bun Dockerfile (no bundling)

# Stage 1: install prod deps (cached)
FROM oven/bun:latest AS deps
WORKDIR /app

# Copy only files needed to resolve dependencies for better layer caching
COPY package.json ./

# Install only production dependencies
RUN bun install --production

# Stage 2: runtime
FROM oven/bun:latest AS runner
WORKDIR /app
ENV NODE_ENV=production

# Bring in production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

# The server defaults to port 3001 when PORT is unset
EXPOSE 3001

# Run the TypeScript entry directly with Bun
CMD ["bun", "run", "src/server.ts"]
