/**
 * js 资源优化
 */
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var crypto = require('crypto');
var log = require('color-log');

var project = 'console';
var release = 'webapp';
var relativePath = '../'+ project +'/' + release;

var exec = child_process.exec;
var uglifyjs = './node_modules/.bin/uglifyjs ';
var output = path.resolve( relativePath + '/resources/pkg') + '/';

// 相对于站点根路径的相对路径
var relativePath = /\/pkg\/.*/i;
// 引入js文件的指令正则
var jsReg = /\s*#set\s*\(\s*\$jsList\s*=\s*\[\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*/i;

function compressJs( absolutePaths, file ){
    // 为打包后的文件添加时间戳
    var t = new Date();
    var curOutput = output + 'j/' + t.getTime() + '.min.js'
    var optimizeCommond = uglifyjs + absolutePaths.join(' ') +' -o ' + curOutput + ' -c -m';
    // console.log('Optimizing ' + fileList + ' ...');

    // 执行资源优化打包指令
    exec(optimizeCommond, function( err, stdout, stderr ){
        if(err) throw err;
        // console.log("It's OK that "+ fileList)
        fs.readFile(file, function( err, data ){
            if(err) throw err;
            fs.readFile( curOutput,  function(err, data1) {
                if(err) throw err;
                var digest = crypto.createHash('md5').update(data1.toString()).digest('hex').slice(0, 10);
                newOutput = curOutput.replace( t.getTime()+'', digest );

                fs.renameSync( curOutput, newOutput );

                newOutput = newOutput.match( relativePath )[0].slice(1);

                var originCont = data.toString();
                var updateCont = originCont.replace(jsReg, '\r\n#set($jsList = ["' + newOutput + '"])\r\n');

                var fileBuf = new Buffer(updateCont);
                fs.writeFile(file, fileBuf, function(err){
                    if(err) throw err;
                    // console.log('Write ' + file + ' success')
                    log.info('*** 完成JS地址替换: ' + file);
                })
            })
            
        })
    })
}

// export.compressJs = compressJs;
module.exports = {
    compressJs: compressJs
}
