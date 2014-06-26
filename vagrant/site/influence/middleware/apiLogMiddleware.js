var
    Q               = require("q"),
    constants       = require("../constants/constants");

module.exports = function(logger, apiLogBusiness){

    var apiLogger = function(req, res, next){

        logger.log("=====================");
        logger.log("response status is: ", res.statusCode);
        logger.log("-----");

        var token = req[constants.reqParams.PROP_AUTHTOKEN],
            tokenStr = (token && token.token) || null;

        Q.when(apiLogBusiness.log(tokenStr, req, res)).then(
            function(log){
                if(!log){
                    logger.log("!!!ERROR: Not be able to insert API Call Log. code 1");
                }else{
                    logger.log("Inserted API Call Log.");
                }
            }
        ).catch(
            function(err){
                logger.log("!!!ERROR: Not be able to insert API Call Log. code 2");
                logger.log(err);
            }
        ).done(
            function(){
                logger.log("API call log insert Done!");
                logger.log("=====================");
            }
        );
    };

    return {
        apiLogger : apiLogger
    }
};