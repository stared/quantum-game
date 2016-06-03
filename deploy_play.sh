# the only other step is updating index.html file!
jspm bundle-sfx --minify app.js
rm bundled/build.js*
mv build.js* bundled/
s3cmd sync bundled/index.html s3://play.quantumgame.io/
s3cmd sync bundled/build.js s3://play.quantumgame.io/
s3cmd sync --recursive css s3://play.quantumgame.io/
s3cmd sync --recursive sounds s3://play.quantumgame.io/
s3cmd sync bg.jpg s3://play.quantumgame.io/
s3cmd sync logo.svg s3://play.quantumgame.io/
s3cmd sync favicon.ico s3://play.quantumgame.io/
s3cmd sync screenshot_qg_dev.png s3://play.quantumgame.io/
