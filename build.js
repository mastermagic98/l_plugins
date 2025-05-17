var fs = require('fs');
var path = require('path');

var files = [
  'src/utils.js',
  'src/api.js',
  'src/trailer.js',
  'src/line.js',
  'src/component-main.js',
  'src/component-full.js',
  'src/plugin.js',
  'src/index.js'
];

var output = files.map(function(file) {
  return fs.readFileSync(path.join(__dirname, file), 'utf8');
}).join('\n');

fs.writeFileSync('test_youtube.js', output);
