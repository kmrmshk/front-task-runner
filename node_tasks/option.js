const fse = require('fs-extra');
const json = 'package.json';

var packageJson = fse.readFileSync(json, 'utf8')
var data = JSON.parse(packageJson);

module.exports = data['tasks'];
