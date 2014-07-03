module.exports = function(dbProvider){

    var
        createAdminAuthToken = function(token){
            return dbProvider.upsertAdminAuthToken(token);
        },

        invalidateAdminAuthToken = function(tokenStr){
            return dbProvider.upsertAdminAuthToken({token : tokenStr}, {$set : {isActive : false}});
        },

        findAdminAuthTokenByToken = function(tokenStr){
            return dbProvider.findAdminAuthTokenByToken(tokenStr);
        };

    return {
        createAdminAuthToken        : createAdminAuthToken,
        invalidateAdminAuthToken    : invalidateAdminAuthToken,
        findAdminAuthTokenByToken   : findAdminAuthTokenByToken
    };
};

