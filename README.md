Quantum Game
============

Quantum Game - play with photons, superposition and entanglement. With true quantum mechanics underneath.

Official address: http://quantumgame.io/.

State: in development (alpha). Release data (estimate): 31 March 2016.

Authors: [Piotr Migdał](http://migdal.wikidot.com/), [Patryk Hes](https://github.com/pathes), [Michał Krupiński](http://www.fiztaszki.pl/user/3).

Supported by [eNgage III/2014](http://www.fnp.org.pl/laureaci-engage-iii-edycja/) grant.

# Development version

## Installings

First, install global packages:
```bash
npm install --global karma-cli
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
