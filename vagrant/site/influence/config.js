module.exports = function(){
    return {
        db : {
            type :              "mongoDB",
            connectionString :  "mongodb://localhost:27017/influenceDb",
            poolSize :          10
        },
        app : {
            auth : {
                tokenExpirationAddOn : 86400 //in seconds, 24hrs
            }
        }
    };
}();


