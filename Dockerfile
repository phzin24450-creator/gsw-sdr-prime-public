FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --chown=node:node src ./src
COPY --chown=node:node db ./db
COPY --chown=node:node web ./web
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 ENABLE_DEMO=false AUTO_DRAFTS=false
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
