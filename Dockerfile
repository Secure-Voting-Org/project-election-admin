# Stage 1: Build the React/Vite application
FROM node:20-slim AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./

RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the static assets
# Accept build-time arguments for environment variables
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built assets from the previous stage to Nginx's HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
