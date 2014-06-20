module.exports = function(Q, dbProvider){

    var
        findAdminAccountById = function(adminId){
            return dbProvider.findAdminAccountById(adminId);
        },
        findAdminAccountByEmail = function(email){
            return dbProvider.findAdminAccountByEmail(email);
        },
        findAdminAccountByTenantAndEmail = function(tenantId, email){
            return dbProvider.findAdminAccountByTenantAndEmail(tenantId, email);
        },
        findAdminAccountByTenantAndUsername = function(tenantId, username){
            return dbProvider.findAdminAccountByTenantAndUsername(tenantId, username);
        },
        upsertAdminAccount = function(adminAccountDo){
            return dbProvider.upsertAdminAccount(adminAccountDo);
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
        findAdminAccountById                : findAdminAccountById,
        findAdminAccountByEmail             : findAdminAccountByEmail,
        findAdminAccountByTenantAndEmail    : findAdminAccountByTenantAndEmail,
        findAdminAccountByTenantAndUsername : findAdminAccountByTenantAndUsername,
        upsertAdminAccount                  : upsertAdminAccount,

        findAppAccountById                  : findAppAccountById,
        findAppAccountByAppKey              : findAppAccountByAppKey,
        upsertAppAccountById                : upsertAppAccountById,

        findAdminToken                      : findAdminToken,
        upsertAdminTokenByToken             : upsertAdminTokenByToken
    };
};

