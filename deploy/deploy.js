var config = require('./conf/console.json');

// 先pull
var init = function(callback){
    if(typeof callback !== 'function') callback = function(){}
    log.info('从develop分支拉取代码...')
    exec('cd '+ config.repository_path +'; git checkout develop', function(err, out){
        exec('cd '+ config.repository_path +'; git pull', function(err, out){
            callback()
        })
    })
}

var deploy = function( config ){

}