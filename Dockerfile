
FROM node:21

WORKDIR /app/controlia

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "start"]
