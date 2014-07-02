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
/*

                //Mac Laptop
                key        : "NjE1YjhiMDQtM2U3My00ZjhiLWFjZjEtYTc5OTdjOWU1Yzc1OmM4ZTcwNjQzLTg1YzAtNDY4YS04YmFmLTNkNzE1ZThlNjIyMw,,",
                secret     : "ZmY3NmVlZmQtZWZjNC00YTE4LTk1NTItNzU0NDViZTQ5MWFjOjk3MjljMmIxLTlmNmEtNDlhOC1hNjA1LTE3NTQ3NGE0YzFjNw,,",

                tenantId : '53b374ba0d45fa990c8dc866'
*/
                //Office
                key      : "YTFmNGE3ZWMtMjI4Zi00YzA3LTkyYTgtMWUwNjc5Y2YyNDNlOjk0ZmU2NGQ3LTAxMjUtNDg3My1iMTk4LWQ1NzMxZmY3NDdhNw,,",
                secret   : "MmY4MjY5YTEtNTg3NS00MTZlLWIzZjItOTljMjlmZTQ4NDdhOmNjODdhZDhjLWMwM2ItNGU1Ni04ZDYwLWRkMDkxZWRjMGQ4Ng,,",

                tenantId : "53ac3c7a14f1670f0eb93c55"
            }
        }
    };
}();
