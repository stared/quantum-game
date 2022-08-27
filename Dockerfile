FROM node:14-alpine

RUN mkdir /app
WORKDIR /app
COPY package*.json /app
RUN npm config set unsafe-perm true && \
    npm install http-server -g && \
    npm install
COPY *.svg *.jpg /app/
COPY css/* /app/css/
COPY sounds/* /app/sounds/
COPY favicon.ico /app/
COPY build.js /app/
COPY index.html /app/
CMD ["http-server",".","-p","8080"]

