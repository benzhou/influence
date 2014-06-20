var crypto = require('crypto');

module.exports = function(plain){
    var
        sha256Hash = function(plain) {
            var hash = crypto.createHash('sha256').update(plain).digest('base64');
        },

        typeIs = (function(global) {
            var cache = {};
            return function(obj) {
                var key;
                return obj === null ? 'null' // null
                    : obj === global ? 'global' // window in browser or global in nodejs
                    : (key = typeof obj) !== 'object' ? key // basic: string, boolean, number, undefined, function
                    : obj.nodeType ? 'object' // DOM element
                    : cache[key = ({}).toString.call(obj)] // cached. date, regexp, error, object, array, math
                    || (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
            };
        }(this));

    return {
        sha256Hash : sha256Hash,

        typeIs      : typeIs
    }
}();

