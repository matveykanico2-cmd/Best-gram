FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages packages
RUN npm install --include-workspace-root
COPY apps/api apps/api
WORKDIR /app/apps/api
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
