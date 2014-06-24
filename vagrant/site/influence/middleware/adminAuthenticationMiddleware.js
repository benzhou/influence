var InfluenceError = require('../error/influenceError'),
    errorCodes = require('../error/errorCodes');

module.exports = function(logger, authBusiness){

    var req_prop_const = "authToken",
        adminTokenAuth = function(req, res, next){
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

        //retrieve token info and validate
        Q.when(authBusiness.validateAdminAuthToken(token)).then(
            function(tokenObj){
                if(!tokenObj){
                    throw new InfluenceError(errorCodes.C_401_001_002.code);
                }

                req[req_prop_const] = tokenObj;
                next();
            }
        ).catch(
            function(err){
                logger.log("Catch an error!");
                logger.log(err);

                var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                res.json(
                    resObj.httpStatus,
                    {
                        code : resObj.code,
                        message : resObj.message
                    }
                );
            }
        ).done();
    };

    return {
        adminTokenAuth : adminTokenAuth
    }
};
