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

Bundle it (and minify, if you want):

```bash
jspm bundle-sfx --minify app
```

It creates a `build.js` file. To run it wee need a modified `index.html` (it is a *manually*-modified file, stored in `bundled/index.html`).

On the server, the structure of files should look as follows:

```bash
css\
favicon.ico
build.js
index.html
```
