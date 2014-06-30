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
        },
        admin : {
            app : {
                key      : "YTFmNGE3ZWMtMjI4Zi00YzA3LTkyYTgtMWUwNjc5Y2YyNDNlOjk0ZmU2NGQ3LTAxMjUtNDg3My1iMTk4LWQ1NzMxZmY3NDdhNw,,",
                secrect  : "MmY4MjY5YTEtNTg3NS00MTZlLWIzZjItOTljMjlmZTQ4NDdhOmNjODdhZDhjLWMwM2ItNGU1Ni04ZDYwLWRkMDkxZWRjMGQ4Ng,,"
            }
        }
    };
}();

