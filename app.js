var ndir = require('ndir');
var path = require('path');
var fs = require('fs');
var child_process = require('child_process');
var exec = child_process.exec;
var uglifyjs = './node_modules/.bin/uglifyjs ';

var resourceDir = '../console/fe-source/view/cdn';
// 引入js文件的指令正则
var jsReg = /^\s*#set\s*\(\s*\$jsList\s*=\s*\[\s*"\s*([\/]?[\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*$/i;
var _jsReg = /\s*#set\s*\(\s*\$jsList\s*=\s*\[\s*"\s*([\/]?[\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*/i;
// 引入css文件的指令正则
var cssReg = /^\s*#set\s*\(\s*\$cssList\s*=\s*\[\s*"\s*([\/]?[\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*$/i;
// var contentReg = /"\s*([\/]?[\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[\w-]+)([\/][.\w-]+)*\s*"\s*)*/i
// velocity指令中的文件提取正则
var fileReg = /([\/]?[\w-]+)([\/][.\w-]+)*/g
var basePath = path.resolve('../console/fe-source/resources/js') + '/';
var output = path.resolve('../console/fe-source/pkg') + '/'

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
        // 获取引入静态资源(js/css)的velocity指令
        var originFileStr = curLineStr.match(jsReg);
        if(!originFileStr) return;

        // 提取需要打包的资源
        var fileList = originFileStr[0].match(fileReg).slice(2);
        var absolutePaths = [];

        // 转换为绝对路径
        var len = fileList.length;
        for(var i = 0; i < len; i++ ){
            absolutePaths.push( basePath + fileList[i] );
        }

        // 为打包后的文件添加时间戳
        var t = new Date();
        var curOutput = output + t.getTime() + '.min.js'
        var optimizeCommond = uglifyjs + absolutePaths.join(' ') +' -o ' + curOutput + ' -c -m';
        console.log('Optimizing ' + fileList + ' ...');

        // 执行资源优化打包指令
        exec(optimizeCommond, function( err, stdout, stderr ){
            if(err) throw err;
            console.log("It's OK that "+ fileList)
            fs.readFile(file, function( err, data ){
                if(err) throw err;
                var originCont = data.toString();
                var updateCont = originCont.replace(_jsReg, '\r\n#set($jsList = ["' + curOutput + '"])\r\n');

                var fileBuf = new Buffer(updateCont);
                fs.writeFile(file, fileBuf, function(err){
                    if(err) throw err;
                    console.log('Write ' + file + ' success')
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