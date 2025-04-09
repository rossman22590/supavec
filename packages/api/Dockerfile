# ------ Builder Stage ------
    FROM oven/bun:latest AS builder
    WORKDIR /app
    
    # Copy API package files
    COPY package.json ./
    COPY src ./src
    COPY tsconfig.json ./
    
    # Install dependencies
    RUN bun install
    
    # Build the application
    RUN bun build ./src/server.ts --outfile ./dist/server.js --target node
    
    # Debug: Verify build output
    RUN mkdir -p dist
    RUN echo "Build output:" && ls -la dist
    
    # ------ Production Stage ------
    FROM oven/bun:latest
    WORKDIR /app
    
    # Copy the built application
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/dist ./dist
    
    # Install production dependencies
    RUN bun install --production
    
    # Set environment variables
    ENV NODE_ENV=production
    ENV PORT=3010
    
    # Expose the port
    EXPOSE 3010
    
    # Start the application
    CMD ["bun", "./dist/server.js"]
    
