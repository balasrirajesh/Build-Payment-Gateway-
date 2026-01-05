FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

EXPOSE 8000

# Start the compiled code
CMD ["node", "dist/index.js"]