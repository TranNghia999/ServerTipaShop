# Stage 1: Build (nếu bạn dùng TypeScript hoặc có bước build)
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy source code
COPY . .

# Stage 2: Run
FROM node:18-alpine

WORKDIR /app

# Copy only production files from builder
COPY --from=builder /app /app

# Create non-root user for security
RUN addgroup -S app && adduser -S app -G app
USER app

# Expose port (matches your server code)
EXPOSE 8000
ENV PORT=8000

# Start the NodeJS server
CMD ["node", "index.js"]

