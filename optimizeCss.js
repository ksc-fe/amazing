/**
 * css 资源优化
 */
var fs = require('fs');
var path = require('path');

var log = require('color-log');
var compressor = require('yuicompressor');
var ndir = require('ndir');
var md5 = require('./tools').md5;
var spriteConfig = require('./sprite-config.json');

var cssReg = /\s*#set\s*\(\s*\$cssList\s*=\s*\[\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*(,\s*"\s*([\/]?[.\w-]+)([\/][.\w-]+)*\s*"\s*)*\s*\]\s*\)\s*/i;
var relativePath = /\/pkg\/.*/i;
var _relativePath = '';
var md5Part = '';

// 替换资源地址
var replacePath = function( file ){
    fs.readFile(file, function( err, data ){
        if(err) throw err;
        spriteConfig.output.combine = md5Part + '.min.css'

        var _basePath = path.resolve( _relativePath + '/resources/pkg/c') + '/';
        var _output = _basePath + md5Part + '.min.css';
        var originCont = data.toString();

        _output = _output.match( relativePath )[0].slice(1);

        var updateCont = originCont.replace(cssReg, '\r\n#set($cssList = ["' + _output + '"])\r\n');

        fs.writeFile(file, new Buffer(updateCont), function(err){
            if(err) throw err;
            log.info('>>> 完成CSS地址替换: ' + file);
        })
    })
}

var compressCss = function( cssList, file, opt ){
    if(!cssList | cssList.length < 1) return;

    var cssArr = [];
    var project = opt.project;
    var release = opt.release;
    _relativePath = '../'+ project +'/' + release;

    cssList.forEach(function( css ){
        cssArr.push( fs.readFileSync( css ) );
    })

    // 合并css
    compressor.compress( cssArr.join(''), {
        charset: 'utf8',
        type: 'css'
    }, function(err, data, extra){
        md5Part = md5( data ).slice(0, 10);
        var basePath = path.resolve( _relativePath + '/resources') + '/';
        var output = basePath + 'pkg/c/' + md5Part + '.min.css';
        
        fs.writeFileSync( output, new Buffer( data ) );
        replacePath( file );
    } )
    
}

function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex');
};

// export.compressCss = compressCss;
module.exports = {
    compressCss: compressCss
}
