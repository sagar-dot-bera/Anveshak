# Multi-stage Dockerfile for React Vite Frontend

# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package descriptors first to leverage caching
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build arguments for Vite environment variables
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build static production bundle
RUN npm run build

# Stage 2: Runtime stage with Nginx
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Remove default static files
RUN rm -rf ./*

# Copy build artifacts and custom nginx configuration
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
