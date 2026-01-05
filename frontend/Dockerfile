FROM node:18-alpine

WORKDIR /app

# Copy package.json first to cache dependencies
COPY package*.json ./

# Install dependencies INSIDE the container (This fixes the OS mismatch)
RUN npm install

# Copy the rest of the code (Docker will now ignore your local node_modules)
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]