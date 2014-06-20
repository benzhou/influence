module.exports = function(dbProvider, accountDataObject){

    var
        getAdminAccountById = function(adminId){
            return dbProvider.findAdminAccountById(adminId);
        },

        upsertAdminAccountById = function(adminDo){
            return dbProvider.upsertAdminAccountById(adminDo);
        },

        findAppAccountById = function(appId){
            return dbProvider.findAppAccountById(appId);
        },

        findAppAccountByAppKey = function(appKey){
            return dbProvider.findAppAccountByAppKey(appKey);
        },

        upsertAppAccountById = function(appDo){
            return dbProvider.upsertAppAccountById(appDo);
        };

    return {
        getAdminAccountById     : getAdminAccountById,
        upsertAdminAccountById  : upsertAdminAccountById,

        findAppAccountById      : findAppAccountById,
        findAppAccountByAppKey  : findAppAccountByAppKey,
        upsertAppAccountById    : upsertAppAccountById
    };
};

