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
        AFFILIATE_EX_LINK_TYPE : {
            FOURSQUARE : "FOURSQUARE"
        },
        ACTIONS : {
            VIEW_ADMIN                  : "VIEW_ADMIN",
            EDIT_ADMIN                  : "EDIT_ADMIN",
            VIEW_PERMISSION_ADMIN       : "VIEW_PERMISSION_ADMIN",
            EDIT_PERMISSION_ADMIN       : "EDIT_PERMISSION_ADMIN",
            VIEW_TENANT                 : "VIEW_TENANT",
            EDIT_TENANT                 : "EDIT_TENANT",
            VIEW_AFFILIATE              : "VIEW_AFFILIATE",
            EDIT_AFFILIATE              : "EDIT_AFFILIATE",
            VIEW_ACTIONS                : "VIEW_ACTIONS",
            EDIT_ACTIONS                : "EDIT_ACTIONS",
            VIEW_POST                   : "VIEW_POST",
            EDIT_POST                   : "EDIT_POST"
        }
    };
}();