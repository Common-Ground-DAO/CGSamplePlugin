FROM node:20-alpine AS development-dependencies-env
COPY . /app/
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
COPY . /app/
RUN rm -f /app/.env /app/.env.local
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
COPY .env /app/.env
COPY docker.env.local /app/.env.local
WORKDIR /app
RUN npx hardhat compile --config /app/contracts/hardhat.config.cjs
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/prisma /app/prisma
COPY --from=build-env /app/generated /app/generated
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY .env /app/.env
COPY docker.env.local /app/.env.local
WORKDIR /app
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]