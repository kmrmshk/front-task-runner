// watch edited-files

// import external modules.
const _ = require('underscore');
const path = require('path');
const slash = require('slash');
const globule = require('globule');
const chokidar = require('chokidar');
const minimatch = require('minimatch');
const shell = require('shelljs');

var config = require('./option')['watch'];
var watcher = chokidar.watch('**/*', {
    cwd: './',
    ignored: [
        '!.*',
        '/node_tasks/**/*'
    ],
    ignoreInitial: true,
    followSymlinks: true,
    usePolling: true,
    ignorePermissonErrors: true,
    atomic: false
});
var shellConfig = {
    async: false,
    silence: true
};

watcher.on('all', function(event, file){
    var filePath = slash(file);

    if(!(event === 'add' || event === 'change')) {
        return;
    }

    var filteredList = _.filter(config, function(command, pattern){
        var fixedPattern = path.parse(pattern)
        var matching = minimatch(filePath, pattern);
        //matching && console.log('matched -> ' + pattern);
        return matching;
    });

    _.each(filteredList, function(commandList) {
        _.each(commandList, function(command) {
            var concatCommand = [command, filePath].join(' ');
            console.info('Command attempts -> \n' + concatCommand);
            shell.exec(concatCommand, shellConfig);
        })
    });
});

watcher.on('ready', function(){
    console.log('(」・ω・)」ｽﾃﾝﾊﾞｰｲ…');
});
