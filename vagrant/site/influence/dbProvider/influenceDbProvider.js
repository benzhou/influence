module.exports = function(Q, dbProvider){

    var
        findAdminAccountById = function(adminId){
            return dbProvider.findAdminAccountById(adminId);
        },
        findAdminAccountByEmail = function(email){
            return dbProvider.findAdminAccountByEmail(email);
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
        upsertAppAccountById = function(adminAccountDo){
            return dbProvider.upsertAppAccountById(adminAccountDo);
        },

        findAdminToken = function(adminToken){
            return dbProvider.findAdminToken(adminToken);
        },
        upsertAdminTokenByToken = function(adminTokenDo){
            return dbProvider.upsertAdminTokenByToken(adminTokenDo);
        };

    return {
        findAdminAccountById        : findAdminAccountById,
        findAdminAccountByEmail     : findAdminAccountByEmail,
        upsertAdminAccountById      : upsertAdminAccountById,

        findAppAccountById          : findAppAccountById,
        findAppAccountByAppKey      : findAppAccountByAppKey,
        upsertAppAccountById        : upsertAppAccountById,

        findAdminToken              : findAdminToken,
        upsertAdminTokenByToken     : upsertAdminTokenByToken
    };
};

