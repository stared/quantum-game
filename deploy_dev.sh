# the only other step is updating index.html file!
jspm bundle-sfx -minify app
rm bundled/build.js*
mv build.js* bundled/
s3cmd sync bundled/index.html s3://quantumgame.io/dev/
s3cmd sync bundled/build.js s3://quantumgame.io/dev/
s3cmd sync --recursive css s3://quantumgame.io/dev/
