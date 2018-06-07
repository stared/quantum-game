FROM node:9.3-alpine

# If Github throtlling is an issue try building with something like:
# docker build --build-arg JSPM_GITHUB_AUTH_TOKEN="a_jspm_encrypted_github_token" .

ARG JSPM_GITHUB_AUTH_TOKEN=""
RUN mkdir /app
WORKDIR /app
ADD . /app
RUN apk add --no-cache git && \
      npm install --global karma-cli && \
      npm install jspm -g && \
      jspm config registries.github.auth ${JSPM_GITHUB_AUTH_TOKEN} && \
      npm install http-server -g && \
      npm install && \
      jspm install -y && \
      jspm bundle-sfx --minify app && \
      jspm config registries.github.auth ""
CMD ["http-server",".","-p","8080"]

