/**
 * css 资源优化
 */
var fs = require('fs');
var path = require('path');

var spriter = require('ispriter');
var compressor = require('yuicompressor');
var ndir = require('ndir');
var md5 = require('./tools').md5;
// var spriteConfig = require('./sprite-config.json');

var spriteConfig = 
{
    "workspace": "../console/fe-source",
 
    "input": {
 
        "cssSource": ["./resources/temp/**.css"],
 
        // "ignoreImages": ["*logo.png"],
 
        "format": "png"
    },

    "output": {
 
        "cssDist": "./resources/pkg/c/",
 
        "imageDist": "../i",
 
        "maxSingleSize": 300,
 
        "margin": 5,
 
        "prefix": "sprite_",
 
        "format": "png",
 
        "combine": true,

        "splitCss": false,
 
        "combineCSSRule": false,
 
        "compress": true
    }
}

var cssReg = /\s*#set\s*\(\s*\$cssList\s*=\s*\[\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*/i;
var basePath = path.resolve('../console/fe-source/resources') + '/';
var cssArr = [];

var packageCss = function( cssArr, file ) {
    var md5Part = md5( cssArr.toString() ).slice(0, 10) 
    var output = basePath + 'temp/' + md5Part + '.min.css';
    console.log('version number: ', md5Part);

    fs.exists(basePath + 'temp/', function (exists) {
        console.log('*******************exists: ', exists)
        if( !exists ) {
            ndir.mkdir(basePath + 'temp/');
        }
    });

    fs.readFile(file, function( err, data ){
        if(err) throw err;
        fs.writeFile(output, cssArr, function(err){
            if(err) throw err;
            console.log('Write ' + output + ' success!')
            spriteConfig.output.combine = md5Part + '.min.css'

            spriter.merge(spriteConfig, function(){
                var _basePath = path.resolve('../console/fe-source/resources/pkg/c') + '/';
                var _output = _basePath + md5Part + '.min.css';
                var originCont = data.toString();
                var updateCont = originCont.replace(cssReg, '\r\n#set($cssList = ["' + _output + '"])\r\n');

                var fileBuf = new Buffer(updateCont);
                fs.writeFile(file, fileBuf, function(err){
                    if(err) throw err;
                    console.log('Write ' + file + ' success')
                })
            });
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
