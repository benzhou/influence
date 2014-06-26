var
    Q = require("q"),
    constants       = require('../constants/constants'),
    errorCodes      = require('../error/errorCodes'),
    InfluenceError  = require('../error/influenceError');

module.exports = function(logger, apiLogDataHandler){

    var log = function(tokenStr, req, res){
        var df = Q.defer(),
            reqLogObj = {
                path : req.path,
                headers : req.headers,
                params  : req.params,
                query   : req.query,
                body    : req.body
            };

        var apiCallLog = {
            token       : tokenStr,
            req         : reqLogObj,
            createdOn   : new Date()
        };

        Q.when(apiLogDataHandler.upsertApiCallLog(apiCallLog)).then(
            function(log){
                if(!log) {
                    throw new InfluenceError(errorCodes.S_500_001_001.code);
                }

                df.resolve(df);
            }
        ).catch(
            function(err){
                logger.log("======================");
                logger.log("Error when log API calls");
                logger.log(err);
                logger.log("======================");

                df.reject(df);
            }
        ).done();

        return df.promise;
    };

    return {
        log     : log
    };
};
