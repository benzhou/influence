module.exports = function(dbProvider){

    var
        //Call Log
        insertApiCallLog = function(apiCallLog){
            return dbProvider.insertApiCallLog(apiCallLog);
        },

        //Admin Account
        loadAdminAccounts = function(tenantId, numberOfPage, pageNumber){
            return dbProvider.loadAdminAccountss(tenantId, numberOfPage, pageNumber);
        },
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
        updateAdminAccount = function(adminId, updateDo){
            return dbProvider.updateAdminAccount(adminId, updateDo);
        },

        //App Account
        findAppAccountByAppKey = function(appKey){
            return dbProvider.findAppAccountByAppKey(appKey);
        },
        upsertAppAccountByAppkey = function(adminAccountDo){
            return dbProvider.upsertAppAccountByAppkey(adminAccountDo);
        },

        //Admin Auth Token
        findAdminAuthTokenByToken = function(tokenStr){
            return dbProvider.findAdminAuthTokenByToken(tokenStr);
        },
        upsertAdminAuthToken = function(token, updateObject){
            return dbProvider.upsertAdminAuthToken(token, updateObject);
        },

        //Tenant
        findTenantById = function(tenantId){
            return dbProvider.findTenantById(tenantId);
        },
        loadTenants = function(numberOfPage, pageNumber){
            return dbProvider.loadTenants(numberOfPage, pageNumber);
        },
        upsertTenant = function(tenant){
            return dbProvider.upsertTenant(tenant);
        },
        updateTenant = function(tenantId, updateDo){
            return dbProvider.updateTenant(tenantId, updateDo);
        },

        //Affiliate
        createAffiliate = function(affiliateDo){
            return dbProvider.updateAffiliate(affiliateDo);
        },
        updateAffiliate = function(affiliateId, updateDo){
            return dbProvider.updateAffiliate(affiliateId, updateDo);
        },
        findAffiliateById = function(affiliateId){
            return dbProvider.findAffiliateById(affiliateId);
        },
        loadAffiliates = function(filter, numberOfPage, pageNumber, sort) {
            return dbProvider.loadActions(filter, numberOfPage, pageNumber, sort);
        },

        //Actions
        createAction = function(actionDo){
            return dbProvider.createAction(actionDo);
        },
        updateAction = function(actionId, updateDo){
            return dbProvider.updateAction(actionId, updateDo);
        },
        findActionById = function(actionId){
            return dbProvider.findActionById(actionId);
        },
        loadActions = function(filter, numberOfPage, pageNumber){
            return dbProvider.loadActions(filter, numberOfPage, pageNumber);
        };



    return {
        insertApiCallLog                    : insertApiCallLog,

        loadAdminAccounts                   : loadAdminAccounts,
        findAdminAccountById                : findAdminAccountById,
        findAdminAccountByEmail             : findAdminAccountByEmail,
        findAdminAccountByTenantAndEmail    : findAdminAccountByTenantAndEmail,
        findAdminAccountByTenantAndUsername : findAdminAccountByTenantAndUsername,
        upsertAdminAccount                  : upsertAdminAccount,
        updateAdminAccount                  : updateAdminAccount,

        findAppAccountByAppKey              : findAppAccountByAppKey,
        upsertAppAccountByAppkey            : upsertAppAccountByAppkey,

        findAdminAuthTokenByToken           : findAdminAuthTokenByToken,
        upsertAdminAuthToken                : upsertAdminAuthToken,

        findTenantById                      : findTenantById,
        loadTenants                         : loadTenants,
        upsertTenant                        : upsertTenant,
        updateTenant                        : updateTenant,

        //Affiliates
        createAffiliate                     : createAffiliate,
        updateAffiliate                     : updateAffiliate,
        findAffiliateById                   : findAffiliateById,
        loadAffiliates                      : loadAffiliates,

        //Actions
        createAction                        : createAction,
        updateAction                        : updateAction,
        findActionById                      : findActionById,
        loadActions                         : loadActions
    };
};

