FROM node:lts

WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . .
RUN chown -R node:node /app
USER node

EXPOSE 3001
#CMD npm run dev
