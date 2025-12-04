FROM node:20-alpine

WORKDIR /app

# Copy the entire monorepo (adjust if you want slimmer images)
COPY . .

# Install dependencies (you can switch to pnpm/yarn if that's your choice)
RUN npm install --omit=dev

# Build only this app (define script in package.json, e.g. "build:discovery-service")
# Option 1: nest build directly
# RUN npx nest build discovery-service
# Option 2: via npm script:
# RUN npm run build:discovery-service
RUN npm run build:discovery-service

CMD ["node", "dist/apps/discovery-service/main.js"]
