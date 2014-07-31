var request = require('request'),
    Q = require("Q");

module.exports = function(){
    var
        makeRequest = function(options){
            var df = Q.defer();
            request(options, function (err, response, body) {

                if(err){
                    df.reject(err);
                }else{
                    df.resolve({response:response, body:body});
                }
            });

            return df.promise;
    };

    return {
        makeRequest : makeRequest
    }
}();

