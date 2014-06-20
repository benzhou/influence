var crypto = require('crypto');

module.exports = function(plain){
    var
        sha256Hash = function(plain) {
            var hash = crypto.createHash('sha256').update(plain).digest('base64');
        };

    return {
        sha256Hash : sha256Hash
    }
}();

