var InfluenceError = require('../error/influenceError'),
    errorCodes = require('../error/errorCodes');

module.exports = function(){

    var adminTokenAuth = function(req, res, next){
        var
            token = req.query.token;

        if(!token){
            var err = new InfluenceError(errorCodes.C_401_001_001.code);
            res.json(
                err.httpStatus,
                {
                    code : err.code,
                    message : err.message
                }
            );
            return;
        }

        next();
    };

    return {
        adminTokenAuth : adminTokenAuth
    }
}();
