FROM node:14 as dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM dependencies as build
WORKDIR /app
COPY . ./
RUN npm run build

FROM node:14-alpine as release
WORKDIR /app
COPY --from=dependencies /app/package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist/ ./dist/
EXPOSE 4000
CMD ["node", "./dist/main.js"]
