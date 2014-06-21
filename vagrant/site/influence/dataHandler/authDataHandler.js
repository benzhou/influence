module.exports = function(dbProvider){

    var createAdminAuthToken = function(token){
        return dbProvider.upsertAdminAuthToken(token);
    };

    return {
        createAdminAuthToken : createAdminAuthToken
    };
};

