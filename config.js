System.config({
  "baseURL": "/",
  "transpiler": "babel",
  "babelOptions": {
    "optional": [
      "runtime"
    ]
  },
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "babel": "npm:babel-core@5.4.3",
    "babel-runtime": "npm:babel-runtime@5.4.3",
    "change-case": "npm:change-case@2.3.0",
    "core-js": "npm:core-js@0.9.10",
    "d3": "github:mbostock/d3@3.5.6",
    "katex": "npm:katex@0.5.1",
    "lodash": "npm:lodash@3.10.1",
    "normalize.css": "github:necolas/normalize.css@3.0.3",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.2"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "github:necolas/normalize.css@3.0.3": {
      "css": "github:systemjs/plugin-css@0.1.19"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:camel-case@1.2.0": {
      "sentence-case": "npm:sentence-case@1.1.2",
      "upper-case": "npm:upper-case@1.1.2"
    },
    "npm:change-case@2.3.0": {
      "camel-case": "npm:camel-case@1.2.0",
      "constant-case": "npm:constant-case@1.1.1",
      "dot-case": "npm:dot-case@1.1.1",
      "is-lower-case": "npm:is-lower-case@1.1.1",
      "is-upper-case": "npm:is-upper-case@1.1.1",
      "lower-case": "npm:lower-case@1.1.2",
      "lower-case-first": "npm:lower-case-first@1.0.0",
      "param-case": "npm:param-case@1.1.1",
      "pascal-case": "npm:pascal-case@1.1.1",
      "path-case": "npm:path-case@1.1.1",
      "sentence-case": "npm:sentence-case@1.1.2",
      "snake-case": "npm:snake-case@1.1.1",
      "swap-case": "npm:swap-case@1.1.1",
      "title-case": "npm:title-case@1.1.1",
      "upper-case": "npm:upper-case@1.1.2",
      "upper-case-first": "npm:upper-case-first@1.1.1"
    },
    "npm:constant-case@1.1.1": {
      "snake-case": "npm:snake-case@1.1.1",
      "upper-case": "npm:upper-case@1.1.2"
    },
    "npm:core-js@0.9.10": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:dot-case@1.1.1": {
      "sentence-case": "npm:sentence-case@1.1.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:is-lower-case@1.1.1": {
      "lower-case": "npm:lower-case@1.1.2"
    },
    "npm:is-upper-case@1.1.1": {
      "upper-case": "npm:upper-case@1.1.2"
    },
    "npm:katex@0.5.1": {
      "match-at": "npm:match-at@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:lodash@3.10.1": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:lower-case-first@1.0.0": {
      "lower-case": "npm:lower-case@1.1.2"
    },
    "npm:param-case@1.1.1": {
      "sentence-case": "npm:sentence-case@1.1.2"
    },
    "npm:pascal-case@1.1.1": {
      "camel-case": "npm:camel-case@1.2.0",
      "upper-case-first": "npm:upper-case-first@1.1.1"
    },
    "npm:path-case@1.1.1": {
      "sentence-case": "npm:sentence-case@1.1.2"
    },
    "npm:process@0.11.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:sentence-case@1.1.2": {
      "lower-case": "npm:lower-case@1.1.2"
    },
    "npm:snake-case@1.1.1": {
      "sentence-case": "npm:sentence-case@1.1.2"
    },
    "npm:swap-case@1.1.1": {
      "lower-case": "npm:lower-case@1.1.2",
      "upper-case": "npm:upper-case@1.1.2"
    },
    "npm:title-case@1.1.1": {
      "sentence-case": "npm:sentence-case@1.1.2",
      "upper-case": "npm:upper-case@1.1.2"
    },
    "npm:upper-case-first@1.1.1": {
      "upper-case": "npm:upper-case@1.1.2"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    }
  }
});

