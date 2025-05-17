# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock or pnpm-lock.yaml)
COPY package.json package-lock.json* ./
# If you are using yarn or pnpm, uncomment the respective line below and comment out the npm ci line
# COPY yarn.lock ./
# COPY pnpm-lock.yaml ./

# Install project dependencies
RUN npm ci
# If using yarn: 
# RUN yarn install --frozen-lockfile
# If using pnpm:
# RUN pnpm install --frozen-lockfile

# Copy the rest of the application code into the container
COPY . .

# Build the Vite application for production
RUN npm run build

# Stage 2: Serve the application using a lightweight web server
FROM nginx:alpine

# Copy the build output from the builder stage to Nginx's web server directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration file if you have one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
