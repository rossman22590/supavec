# ------ Builder Stage ------
FROM oven/bun:latest AS builder
WORKDIR /app

# Copy package configuration to leverage caching
COPY package.json ./

# Install all dependencies
RUN bun install

# Copy the rest of the application source code
COPY . .

# Build the application using Bun
RUN bun run build

# ------ Production Stage ------
FROM oven/bun:latest
WORKDIR /app

# Copy package configuration
COPY package.json ./

# Install only production dependencies
RUN bun install --production

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port your application uses (adjust if different from 3000)
EXPOSE 3000

# Start the built application.
# This uses the built file from dist as specified in your package.json main field.
CMD [ "bun", "run", "./dist/index.js" ]
