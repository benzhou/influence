module.exports = function(){

    return {
        reqParams : {
            PROP_AUTHTOKEN  : "authToken",
            PROP_AUTHORIZATION : "authorization",
            PROP_AUTHORIZATION_TABLE : "authorizationTable"
        },
        QUERY_STRING_PARAM :{
            GET_TENANTS : {
                ACTIVE_ONLY : "ao"
            }
        },
        ACTIONS : {
            VIEW : "VIEW_ACTION",
            EDIT : "EDIT_ACTION"
        }
    };
}();