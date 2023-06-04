// Since Angular 9+ creates "main.js" in "server" folder and not
// "server.js" in root folder then we need this custom server.js
// that is located in root folder and fires our REAL server (main.js) manually
// Src: https://github.com/tjanczuk/iisnode/issues/338#issuecomment-41727212 or
// https://stackoverflow.com/a/23520004
require(__dirname + '\\server\\main.js');
