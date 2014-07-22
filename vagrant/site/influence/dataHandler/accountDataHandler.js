module.exports = function(dbProvider){

    var
        //Admin Account
        loadAdminAccounts = function(filter, numberOfPage, pageNumber, sort){
            return dbProvider.loadAdminAccounts(filter, numberOfPage, pageNumber, sort);
        },
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
        updateAdminAccount = function(adminId, updateDo){
            return dbProvider.updateAdminAccount(adminId, updateDo);
        },

        //App Account
        findAppAccountByAppKey = function(appKey){
            return dbProvider.findAppAccountByAppKey(appKey);
        },
        upsertAppAccountByAppkey = function(adminAccountDo){
            return dbProvider.upsertAppAccountByAppkey(adminAccountDo);
        };

    return {
        loadAdminAccounts                   : loadAdminAccounts,
        getAdminAccountById                 : getAdminAccountById,
        findAdminAccountByEmail             : findAdminAccountByEmail,
        findAdminAccountByTenantAndEmail    : findAdminAccountByTenantAndEmail,
        findAdminAccountByTenantAndUsername : findAdminAccountByTenantAndUsername,
        upsertAdminAccount                  : upsertAdminAccount,
        updateAdminAccount                  : updateAdminAccount,

        findAppAccountByAppKey              : findAppAccountByAppKey,
        upsertAppAccountByAppkey            : upsertAppAccountByAppkey
    };
};

