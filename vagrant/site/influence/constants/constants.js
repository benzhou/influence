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
        REQ_HEADERS : {
            X_FORWARDED_FOR : "x-forwarded-for",
            USER_AGENT      : "user-agent"
        },
        AFFILIATE_EX_LINK_TYPE : {
            FOURSQUARE : "FOURSQUARE"
        },
        SYSTEM_DEFAULTS : {
          CREATED_BY : "SYSTEM_CREATED_BY",
          AFFILIATE_CREATED_FROM : {
              USER_POST : "UserPost"
          }
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