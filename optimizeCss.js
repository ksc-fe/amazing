/**
 * css 资源优化
 */
var fs = require('fs');
var path = require('path');
var md5 = require('./tools').md5;

var compressor = require('yuicompressor');

var cssReg = /\s*#set\s*\(\s*\$cssList\s*=\s*\[\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*/i;
var basePath = path.resolve('../console/fe-source/pkg') + '/';
var cssArr = [];

var packageCss = function( allCss, file ) {
    var md5Part = md5( allCss.toString() ).slice(0, 10) 
    var output = basePath + md5Part + '.min.css';
    console.log('version number: ', md5Part);

    fs.readFile(file, function( err, data ){
        if(err) throw err;
        fs.writeFile(output, allCss, function(err){
            if(err) throw err;
            console.log('Write ' + output + ' success!')

            var originCont = data.toString();
            var updateCont = originCont.replace(cssReg, '\r\n#set($cssList = ["' + output + '"])\r\n');

            var fileBuf = new Buffer(updateCont);
            fs.writeFile(file, fileBuf, function(err){
                if(err) throw err;
                console.log('Write ' + file + ' success')
            })
        })
    })
    
}

var compressCss = function( cssList, file ){
    if(!cssList | cssList.length < 1) return;

    var len = cssList.length;
    for(var i = 0; i < len; i++) {
        compressor.compress(cssList[i], {
            charset: 'utf8',
            type: 'css'
        }, function(err, data, extra) {
            if(err) throw err;
            cssArr.push( data );

            if( cssArr.length === len ) {
                packageCss( cssArr, file );
            }
        });
    }
    
}

function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex');
};

// export.compressCss = compressCss;
module.exports = {
    compressCss: compressCss
}
