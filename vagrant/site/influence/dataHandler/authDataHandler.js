module.exports = function(dbProvider){

    var
        createAdminAuthToken = function(token){
            return dbProvider.upsertAdminAuthToken(token);
        },

        findAdminAuthTokenByToken = function(tokenStr){
            return dbProvider.findAdminAuthTokenByToken(tokenStr);
        };

    return {
        createAdminAuthToken        : createAdminAuthToken,
        findAdminAuthTokenByToken   : findAdminAuthTokenByToken
    };
};

