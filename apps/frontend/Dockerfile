FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies
RUN npm ci --workspace=apps/frontend

# Copy source code
COPY apps/frontend ./apps/frontend
COPY packages ./packages

# Build application
RUN npm run build --workspace=apps/frontend

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=apps/frontend"]
