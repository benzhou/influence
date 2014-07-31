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
        locationApi:{
            clientId        : "CR2OVYGBBKADU1OXVMWSXKNYKDICACCE0KCY2QWJXSFRWSPZ",
            clientSecrect   : "4VN4Z31M0ZNUKMNR1PPQLOUS01QLSO4HDD34NDRE5JXOOEVR",
            authTokenUrl    : "https://foursquare.com/oauth2/access_token",
            authorizeUrl    : "https://foursquare.com/oauth2/authorize",
            URL             : "https://api.foursquare.com/v2",
            methods         : {
                searchVenue : {
                    endPoint    : "/venues/search",
                    limit       : 10,
                    radius      : 500,
                    categoryId  : "4d4b7105d754a06374d81259"
                },
                venue       : {
                    endPoint    : "/venues"
                }
            },
            version         : "20140701",
            timeoutMS       : 10000
        },
        client : {
            locationApi:{
                clientId        : "CR2OVYGBBKADU1OXVMWSXKNYKDICACCE0KCY2QWJXSFRWSPZ",
                authTokenUrl    : "https://foursquare.com/oauth2/access_token",
                authorizeUrl    : "https://foursquare.com/oauth2/authorize"
            },
            app : {
                //Office
                key      : "NTlmMTdhOGUtNTEyNS00NTMxLWE3MTYtY2NjNjVjZmYzMjRkOjcyYWMxMDg0LTljNTItNDAwMi04NWM0LWVlZmEyYTYyMzNhMw,,",
                secret   : "ZWNkMjhjMzctYTRkYi00YmE3LWJhYmUtZjUwN2Q0ZTA1Y2Q4OjY2MGMxNTA3LWQxYjEtNDYxYi05ZTAyLTUxMTkwMTA3MTg1Ng",
            }
        },
        admin : {
            app : {
                //Office
                key: "NTlmMTdhOGUtNTEyNS00NTMxLWE3MTYtY2NjNjVjZmYzMjRkOjcyYWMxMDg0LTljNTItNDAwMi04NWM0LWVlZmEyYTYyMzNhMw,,",
                secret: "ZWNkMjhjMzctYTRkYi00YmE3LWJhYmUtZjUwN2Q0ZTA1Y2Q4OjY2MGMxNTA3LWQxYjEtNDYxYi05ZTAyLTUxMTkwMTA3MTg1Ng",

                tenantId: "53bc05cd7f7847e21faab5d1"
            }
        }/*
        client : {
            locationApi:{
                clientId        : "CR2OVYGBBKADU1OXVMWSXKNYKDICACCE0KCY2QWJXSFRWSPZ",
                authTokenUrl    : "https://foursquare.com/oauth2/access_token",
                authorizeUrl    : "https://foursquare.com/oauth2/authorize"
            },
            app : {
                //Mac Laptop
                key      : "NjE1YjhiMDQtM2U3My00ZjhiLWFjZjEtYTc5OTdjOWU1Yzc1OmM4ZTcwNjQzLTg1YzAtNDY4YS04YmFmLTNkNzE1ZThlNjIyMw,,",
                secret   : "ZmY3NmVlZmQtZWZjNC00YTE4LTk1NTItNzU0NDViZTQ5MWFjOjk3MjljMmIxLTlmNmEtNDlhOC1hNjA1LTE3NTQ3NGE0YzFjNw"
            }
        },
        admin : {
            app : {
                //Mac Laptop
                key        : "NjE1YjhiMDQtM2U3My00ZjhiLWFjZjEtYTc5OTdjOWU1Yzc1OmM4ZTcwNjQzLTg1YzAtNDY4YS04YmFmLTNkNzE1ZThlNjIyMw,,",
                secret     : "ZmY3NmVlZmQtZWZjNC00YTE4LTk1NTItNzU0NDViZTQ5MWFjOjk3MjljMmIxLTlmNmEtNDlhOC1hNjA1LTE3NTQ3NGE0YzFjNw,,",

                tenantId : '53b374ba0d45fa990c8dc866'

            }
        }*/



    };
}();
