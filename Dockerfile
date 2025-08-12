FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Create credentials dir for service account
RUN mkdir -p /app/creds

EXPOSE 8080

CMD ["node", "server.js"]


