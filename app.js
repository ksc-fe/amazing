/**
 * 静态资源优化
 * author：kreding
 * date: 2014-09-15
 */

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var child_process = require('child_process');

var ndir = require('ndir');
var optimizeCss = require('./optimizeCss').compressCss;
var crypto = require('crypto');

var exec = child_process.exec;
var uglifyjs = './node_modules/.bin/uglifyjs ';
var resourceDir = '../console/fe-source/view/cdn';
// 引入js文件的指令正则
var jsReg = /\s*#set\s*\(\s*\$jsList\s*=\s*\[\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*/i;
// 引入css文件的指令正则
var cssReg = /\s*#set\s*\(\s*\$cssList\s*=\s*\[\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*/i;
// velocity指令中的文件提取正则
var fileReg = /\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*/g
var baseJsPath = path.resolve('../console/fe-source/resources/js') + '/';
var baseCssPath = path.resolve('../console/fe-source/resources/css') + '/';
var output = path.resolve('../console/fe-source/resources/pkg') + '/'

// 遍历指定目录的文件
ndir.walk(resourceDir, function onDir(dirpath, files) {
  // console.log(' * %s', dirpath);
  for (var i = 0, l = files.length; i < l; i++) {
    var info = files[i];
    if (info[1].isFile()) {
      // console.log('   * %s', info[0]);
      readLine( info[0] );
    }
  }
}, function end() {
  // console.log('walk end.');
}, function error(err, errPath) {
  console.error('%s error: %s', errPath, err);
});

// 逐行读取内容，并获取静态资源文件列表
function readLine( file ){
    var lineNumber = 0;
    var that = ndir.createLineReader( file ).on('line', function(line) {
        var curLineStr = line.toString();
        var fileType = null;
        // 获取引入静态资源(js/css)的velocity指令
        var originFileStr = curLineStr.match(jsReg);
        if( originFileStr ) {
            fileType = 'js';
        }else if( originFileStr = curLineStr.match(cssReg) ){
            fileType = 'css';
        }else if(!originFileStr) {
            return;   
        }

        // 提取需要打包的资源
        var fileList = originFileStr[0].match(fileReg).slice(2);
        var absolutePaths = [];

        // 转换为绝对路径
        var len = fileList.length;
        var basePath = fileType === 'js' ? baseJsPath : baseCssPath;
        for(var i = 0; i < len; i++ ){
            absolutePaths.push( basePath + fileList[i] );
        }

        if( fileType === 'css' ) {
            optimizeCss( absolutePaths, file );
            return;
        }

        // 为打包后的文件添加时间戳
        var t = new Date();
        var curOutput = output + 'j/' + t.getTime() + '.min.js'
        var optimizeCommond = uglifyjs + absolutePaths.join(' ') +' -o ' + curOutput + ' -c -m';
        console.log('Optimizing ' + fileList + ' ...');

        // 执行资源优化打包指令
        exec(optimizeCommond, function( err, stdout, stderr ){
            if(err) throw err;
            console.log("It's OK that "+ fileList)
            fs.readFile(file, function( err, data ){
                if(err) throw err;
                fs.readFile( curOutput,  function(err, data1) {
                    if(err) throw err;
                    var digest = crypto.createHash('md5').update(data1.toString()).digest('hex').slice(0, 10);
                    newOutput = curOutput.replace( t.getTime()+'', digest );

                    fs.renameSync( curOutput, newOutput );

                    var originCont = data.toString();
                    var updateCont = originCont.replace(jsReg, '\r\n#set($jsList = ["' + newOutput + '"])\r\n');

                    var fileBuf = new Buffer(updateCont);
                    fs.writeFile(file, fileBuf, function(err){
                        if(err) throw err;
                        console.log('Write ' + file + ' success')
                    })
                })
                
            })
        })
        // console.log('%s: %s', '***********', fileList);
    }).on('end', function() {
      // console.log('read a file done.')
    }).on('error', function(err) {
      console.log('error: ', err.message)
    });
}