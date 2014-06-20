module.exports = function(Q, dbProvider){

    var
        findAdminAccountById = function(adminId){
            return dbProvider.findAdminAccountById(adminId);
        },
        
        upsertAdminAccountById = function(adminAccountDo){
            return dbProvider.upsertAdminAccountById(adminAccountDo);
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
        findAdminAccountById    : findAdminAccountById,
        upsertAdminAccountById  : upsertAdminAccountById,

        findAppAccountById      : findAppAccountById,
        findAppAccountByAppKey  : findAppAccountByAppKey,
        upsertAppAccountById    : upsertAppAccountById
    };
};

