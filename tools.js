var crypto = require('crypto');

var md5 = function( text ) {
  return crypto.createHash('md5').update(text).digest('hex');
};

module.exports = {
    md5: function( text ) {
      return crypto.createHash('md5').update(text).digest('hex');
    }
}