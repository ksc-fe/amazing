/**
 * 静态资源优化
 * author：kreding
 * date: 2014-09-15
 */
var path = require('path');

var ndir = require('ndir');
var optimizeJs = require('./optimizeJs').compressJs;
var optimizeCss = require('./optimizeCss').compressCss;

var resourceDir = '../console/fe-source/view/cdn';
// 引入js文件的指令正则
var jsReg = /\s*#set\s*\(\s*\$jsList\s*=\s*\[\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*/i;
// 引入css文件的指令正则
var cssReg = /\s*#set\s*\(\s*\$cssList\s*=\s*\[\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*/i;
// velocity指令中的文件提取正则
var fileReg = /\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*/g;
var baseJsPath = path.resolve('../console/fe-source/resources/js') + '/';
var baseCssPath = path.resolve('../console/fe-source/resources/css') + '/';

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

    // 逐行读取文件
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

        // 提取需要打包的资源路径
        var fileList = originFileStr[0].match(fileReg).slice(2);
        var absolutePaths = [];

        // 转换为绝对路径
        var len = fileList.length;
        var basePath = fileType === 'js' ? baseJsPath : baseCssPath;
        for(var i = 0; i < len; i++ ){
            absolutePaths.push( basePath + fileList[i] );
        }

        if( fileType === 'css' ) {
            // 优化打包Css
            optimizeCss( absolutePaths, file );
        }else{
            // 优化打包Js
            optimizeJs( absolutePaths, file );
        }
    }).on('end', function() {
      // console.log('read a file done.')
    }).on('error', function(err) {
      console.log('error: ', err.message)
    });
}