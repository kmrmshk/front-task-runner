// import external modules.
const _ = require('underscore');
const fse = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path');
const globule = require('globule');
const sprite = require('spritesmith');
const templater = require('spritesheet-templates');

const config = require('./option')['sprite'];

function execTask(file, dir, name, dest) {

  console.log(file, dir, name, dest);

  sprite.run({
    src: file,
    padding: 10
  }, function(error, result){
    var imagePath = path.join(dest.base, dest.image, name + '.png');
    var stylePath = path.join(dest.base, dest.style, name + '.scss');
    if(error) {
      console.log('error ? ', error);
    }
    else {
      var sass = templater({
        sprites: _.map(result.coordinates, function(data, key){
          return _.extend({}, data, {
            name: path.basename(key)
          })
        }),
        spritesheet: _.extend({}, result.properties, {
          image: path.join(/*dest.image, */name + '.png')
        })
      }, {
        format: 'sass'
      });
      mkdirp(path.join(dest.base, dest.image), function(error){
        if(! error) {
          fse.writeFile(imagePath, result.image);
        }
      });
      mkdirp(path.join(dest.base, dest.style), function(error){
        if(! error) {
          fse.writeFile(stylePath, sass);
        }
      });
    }
  });
}

function bundleExecute(option){
  let target = {};
  let files = globule.find({
    src: option.target,
    srcBase: option.cwd || '',
    prefixBase: true
  });

  _.chain(files).each(function(file){
    let stat = fse.statSync(file);
    let dirName = path.dirname(file);
    let relative = path.relative(option.cwd, dirName);
    let dirArr = relative.split(path.sep);

    //console.log(dirName, relative, dirArr);

    if(typeof(target[dirArr[0]]) === 'undefined') {
      target[dirArr[0]] = [];
    }

    if(stat.isFile()) {
      target[dirArr[0]].push(file);
    }
  });

  _.each(target, function(data, key) {
      execTask(data, option.cwd, key, option.dest);
  });
}

// arguments
var args = process.argv.slice(2);

/*
if(args.length){
  _.each(args, function(profileKey){
    if(config.hasOwnProperty(profileKey)){
      bundleExecute(config[profileKey]);
    }
  });
}
else {
  _.each(config, function(option) {
    bundleExecute(option);
  });
}
*/
_.each(config, function(option) {
  bundleExecute(option);
});