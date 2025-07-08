# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install 

# Copy the rest of the application code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the app port
EXPOSE 3000

# Stathe app
CMD ["npm", "start"] 