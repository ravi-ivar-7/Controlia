
FROM node:21

WORKDIR /raz-pay

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "start"]
