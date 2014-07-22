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
                //Office
                key      : "NTlmMTdhOGUtNTEyNS00NTMxLWE3MTYtY2NjNjVjZmYzMjRkOjcyYWMxMDg0LTljNTItNDAwMi04NWM0LWVlZmEyYTYyMzNhMw,,",
                secret   : "ZWNkMjhjMzctYTRkYi00YmE3LWJhYmUtZjUwN2Q0ZTA1Y2Q4OjY2MGMxNTA3LWQxYjEtNDYxYi05ZTAyLTUxMTkwMTA3MTg1Ng",

                tenantId : "53bc05cd7f7847e21faab5d1"


/*

 //Mac Laptop
 key        : "NjE1YjhiMDQtM2U3My00ZjhiLWFjZjEtYTc5OTdjOWU1Yzc1OmM4ZTcwNjQzLTg1YzAtNDY4YS04YmFmLTNkNzE1ZThlNjIyMw,,",
 secret     : "ZmY3NmVlZmQtZWZjNC00YTE4LTk1NTItNzU0NDViZTQ5MWFjOjk3MjljMmIxLTlmNmEtNDlhOC1hNjA1LTE3NTQ3NGE0YzFjNw,,",

 tenantId : '53b374ba0d45fa990c8dc866'

               */
            }
        }
    };
}();
