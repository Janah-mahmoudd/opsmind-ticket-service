# Use official Node LTS image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy source code
COPY . .

# Build TypeScript if needed (here we use ts-node-dev in dev, but for prod build TS)
RUN npx tsc

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the server (compiled JS in dist)
CMD ["node", "dist/server.js"]
