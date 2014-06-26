module.exports = function(){

    var apiLogger = function(req, res, next){

        logger.log("=====================");
        logger.log("res", res);
        logger.log("-----");
        logger.log("=====================");
        next();
    };

    return {
        apiLogger : apiLogger
    }
};