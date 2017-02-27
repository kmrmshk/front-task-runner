// import external modules.
const _ = require('underscore');
const fse = require('fs-extra');
const path = require('path');
const globule = require('globule');
const sass = require('node-sass');

const config = require('./option')['sass'];

// copy target files
function execTask(file, cwd, dest) {
    let stat = fse.statSync(file);
    let inputExtName = path.extname(file);
    let outputExtName = '.css';
    let baseName = path.basename(file, inputExtName);
    let dirName = path.dirname(file);
    let relative = path.relative(cwd, dirName);
    let destPath = path.join(dest, relative, baseName);

    if(! stat.isFile() || stat.isDirectory()){
        return;
    }

    var target = path.join(dirName, baseName) + inputExtName;
    var outCssFile = path.join(dest, relative, baseName) + outputExtName;
    //var outMapFile = path.join(dest, relative, baseName) + '.map';

    console.log(target, '->', outCssFile);

    sass.render(
      {
        file: target,
        outCssFile: outCssFile,
        outputStyle: 'expanded',//'compressed',
        sourceMap: false//true
      },
      function(error, result){
        console.log('error ? ', error);
        console.log('result ? ', result);
        if(!error){
          // No errors during the compilation, write this result on the disk
          fse.writeFile(outCssFile, result.css);
          //fse.writeFile(outMapFile, result.map);
        }
      }
    );
}

function bundleExecute(option){
    //console.log(option);
    let target = globule.find({
        src: option.target,
        srcBase: option.cwd || '',
        prefixBase: true
    });
    //console.log(target);
    _.each(target, function(filePath) {
        execTask(filePath, option.cwd, option.dest);
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