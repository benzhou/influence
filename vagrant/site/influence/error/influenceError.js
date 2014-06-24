var errCodes = require('./errorCodes');
var util = require("util");

module.exports = function(){

    var errCodeToErrorCodeObject = function(code){
        if(code<400000000 || code>599999999) return null;

        var cStr = code.toString(),
            prop = "C_" + cStr.slice(0,3) + "_" + cStr.slice(3,6) + "_" + cStr.slice(6);

        if(!errCodes[prop]) return errCodes.S_500_000_001;

        return errCodes[prop];
    };

    function InfluenceError (code, msg, httpStatus) {
        var isError = code instanceof Error,
            c = isError ? errCodes.S_500_000_001.code : (code || errCodes.S_500_000_001.code),
            msg = isError ? errCodes.S_500_000_001.desc : (msg || errCodeToErrorCodeObject(c).desc || errCodes.S_500_000_001.desc),
            hs = isError ? errCodes.S_500_000_001.httpStatus : (httpStatus || errCodeToErrorCodeObject(c).httpStatus || errCodes.S_500_000_001.httpStatus);

        Error.call(this);
        Error.captureStackTrace(this, arguments.callee);

        this.code = c;
        this.message = msg;
        this.httpStatus = hs;
        this.name = 'InfluenceError';
    };

    util.inherits(InfluenceError, Error);
    //InfluenceError.prototype.__proto__ = Error.prototype;

    return InfluenceError;
}()