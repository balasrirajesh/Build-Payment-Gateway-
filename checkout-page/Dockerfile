FROM node:18-alpine

WORKDIR /app

# Copy package.json first
COPY package*.json ./

# Install dependencies INSIDE the container
RUN npm install

# Copy the rest
COPY . .

# Expose 3001
EXPOSE 3001

# Start
CMD ["npm", "run", "dev"]