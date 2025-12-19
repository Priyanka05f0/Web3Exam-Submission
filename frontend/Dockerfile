# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl for the health check (REQUIRED by instructions)
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start application
CMD ["npm", "run", "dev", "--", "--host"]