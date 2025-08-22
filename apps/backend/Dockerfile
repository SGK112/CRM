FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages ./packages

# Install dependencies
RUN npm ci --workspace=apps/backend

# Copy source code
COPY apps/backend ./apps/backend

# Build application
RUN npm run build --workspace=apps/backend

EXPOSE 3001

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "apps/backend/dist/main.js"]
