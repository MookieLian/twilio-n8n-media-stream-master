FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
# Use install (no lockfile present). If you commit a package-lock.json, you can switch to `npm ci`.
RUN npm install --omit=dev

COPY . .

# Create credentials dir for service account
RUN mkdir -p /app/creds

EXPOSE 8080

CMD ["node", "server.js"]


