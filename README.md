Quantum Game
============

# Development version

## Installing

First, install global packages:
```bash
npm install --global jspm karma-cli
```

Then install local packages.
```bash
npm install
jspm install
```

## Running server

Start HTTP server (e.g. by [http-server](https://www.npmjs.com/package/http-server)).

## Running tests
```bash
karma start
```

# Production version
```bash
jspm bundle --minify app.js
```
