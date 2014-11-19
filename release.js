/**
 * 静态资源优化
 * author：kreding
 * date: 2014-09-15
 */
var path = require('path');

var ndir = require('ndir');
var log = require('color-log');
var IMerge = require('imerge');
var optimizeJs = require('./optimizeJs').compressJs;
var optimizeCss = require('./optimizeCss').compressCss;

// 引入js文件的指令正则
var jsReg = /\s*#set\s*\(\s*\$jsList\s*=\s*\[\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*/i;
// 引入css文件的指令正则
var cssReg = /\s*#set\s*\(\s*\$cssList\s*=\s*\[\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*/i;
// velocity指令中的文件提取正则
var fileReg = /\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*/g;
// 打包之后的文件路径正则
var pkgReg = /^(pkg\/)[jc]\/.*(.min.(j|(cs))s)$/g;

var project = 'console';
var release = 'webapp';
var excludeArr = [];
var relativePath = '../'+ project +'/' + release;
var resourceDir = relativePath + '/view/rds';
var baseJsPath = path.resolve(relativePath + '/resources/js') + '/';
var baseCssPath = path.resolve(relativePath + '/resources/css') + '/';

function init( base ){
    new IMerge({
        from: baseCssPath,
        to: baseCssPath
    }).start()
        .then(function() {
            log.info('>>> 完成雪碧图合并以及相关的资源地址替换.');
            releaseResource( base );
        }).catch(function(err) {
            log.error(">>> 合并雪碧图出错：" , err);
        });
}

function releaseResource( base ) {
    project = base.project;
    release = base.release;
    relativePath = '../'+ project +'/' + release;
    resourceDir = relativePath + '/view';
    excludeArr = base.exclude;
    baseJsPath = path.resolve(relativePath + '/resources/js') + '/';
    baseCssPath = path.resolve(relativePath + '/resources/css') + '/';

    // 遍历指定目录的文件
    ndir.walk(resourceDir, function onDir(dirpath, files) {
      if( isExclude( dirpath ) ) return;

      for (var i = 0, l = files.length; i < l; i++) {
        var info = files[i];
        if (info[1].isFile()) {
          readLine( info[0] );
        }
      }
    }, function end() {
      // log.info('walk end.');
    }, function error(err, errPath) {
      log.error('%s error: %s', errPath, err);
    });
}

function isExclude( dir ){
    for (var n = excludeArr.length - 1; n >= 0; n--) {
        if( -1 !== (dir + '/').indexOf( excludeArr[n] ) ){
            return true;
        }
    };

    return false;
}

// 逐行读取内容，并获取静态资源文件列表
function readLine( file ){
    var lineNumber = 0;
    var opt = {
        project: project,
        release: release
    }

    // 逐行读取文件
    ndir.createLineReader( file ).on('line', function(line) {
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
        var len = fileList.length;
        var absolutePaths = [];

        // 文件数量为1并且 以pkg/j(或pkg/c)开头，以.mim.js结尾的文件忽略掉
        if(1 == len && fileList[0].match(pkgReg)){
            log.info('>>> ' + fileList[0] + ' 是打包过的文件，跳过.')
            return;
        }

        // 转换为绝对路径
        var basePath = fileType === 'js' ? baseJsPath : baseCssPath;
        for(var i = 0; i < len; i++ ){
            absolutePaths.push( basePath + fileList[i] );
        }

        if( fileType === 'css' ) {
            // 优化打包Css
            optimizeCss( absolutePaths, file, opt );
        }else{
            // 优化打包Js
            optimizeJs( absolutePaths, file, opt );
        }
    }).on('end', function() {
      // log.info('read a file done.')
    }).on('error', function(err) {
      log.error('error: ', err.message);
    });
}

// export.compressJs = compressJs;
module.exports = {
    start: init
}