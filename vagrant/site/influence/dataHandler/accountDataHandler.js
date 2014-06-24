module.exports = function(dbProvider){

    var
        getAdminAccountById = function(adminId){
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
        upsertAdminAccount = function(adminDo){
            return dbProvider.upsertAdminAccount(adminDo);
        },

        findAppAccountByAppKey = function(appKey){
            return dbProvider.findAppAccountByAppKey(appKey);
        },
        upsertAppAccountByAppkey = function(adminAccountDo){
            return dbProvider.upsertAppAccountByAppkey(adminAccountDo);
        },

        findTenantById = function(tenantId){
            return dbProvider.findTenantById(tenantId);
        },
        upsertTenant = function(tenant){
            return dbProvider.upsertTenant(tenant);
        };

    return {
        getAdminAccountById                 : getAdminAccountById,
        findAdminAccountByEmail             : findAdminAccountByEmail,
        findAdminAccountByTenantAndEmail    : findAdminAccountByTenantAndEmail,
        findAdminAccountByTenantAndUsername : findAdminAccountByTenantAndUsername,
        upsertAdminAccount                  : upsertAdminAccount,

        findAppAccountByAppKey              : findAppAccountByAppKey,
        upsertAppAccountByAppkey            : upsertAppAccountByAppkey,

        findTenantById                      : findTenantById,
        upsertTenant                        : upsertTenant
    };
};

