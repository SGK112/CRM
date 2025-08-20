FROM node:18-alpine3.20@sha256:1e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
RUN npm ci --workspace=apps/backend

# Copy source code
COPY apps/backend ./apps/backend
COPY packages ./packages

# Build application
RUN npm run build --workspace=apps/backend

EXPOSE 3001

CMD ["npm", "run", "start:prod", "--workspace=apps/backend"]
