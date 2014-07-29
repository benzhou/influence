var Q = require("q"),
    util = require("util"),
    errorCodes    = require('../error/errorCodes'),
    InfluenceError = require('../error/influenceError');

module.exports = function(helpers, logger, locationApiConfig, request){
    //Location
    var searchLocationByCoordinates = function(lan, long){
        var df = Q.defer(),
            locationApiUrl = [
                locationApiConfig.URL, locationApiConfig.method.searchVanue,
                "?client_id=", locationApiConfig.clientId,
                "&client_secrect=", locationApiConfig.clientSecrect,
                "&ll=",lan,",",long
            ].join('');

        request({url: locationApiUrl, method: "GET", timeout: locationApiConfig.timeoutMS, json:true}, function (error, response, body) {
            if (err){
                logger.log("locationApiBusiness request value got an error!");
                logger.log(err);
                df.reject(err);
            } else {
                df.resolve(body);
            }
        });

        return df.promise;
    };

    return {
        searchLocationByCoordinates         : searchLocationByCoordinates
    };
};
