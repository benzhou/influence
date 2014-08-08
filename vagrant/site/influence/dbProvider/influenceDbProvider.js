module.exports = function(dbProvider){

    var
        //Call Log
        insertApiCallLog = function(apiCallLog){
            return dbProvider.insertApiCallLog(apiCallLog);
        },
        createNewConsumerPostLog = function(postLog){
            return dbProvider.createNewConsumerPostLog(postLog);
        },


        //Admin Account
        loadAdminAccounts = function(filter, numberOfPage, pageNumber, sort){
            return dbProvider.loadAdminAccounts(filter, numberOfPage, pageNumber, sort);
        },
        findAdminAccountById = function(adminId){
            return dbProvider.findAdminAccountById(adminId);
        },
        findAdminAccountByEmail = function(email){
            return dbProvider.findAdminAccountByEmail(email);
        },
        findAdminAccountByUsername = function(username){
            return dbProvider.findAdminAccountByUsername(username);
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

        //Admin Permissions
        findAdminAuthorizationsByAdminId = function(adminId){
            return dbProvider.findAdminAuthorizationsByAdminId(adminId);
        },
        createAdminPermissions = function(permission){
            return dbProvider.createAdminPermissions(permission);
        },
        updateAdminPermissionsById = function(id, updateDo){
            return dbProvider.updateAdminPermissionsById(id, updateDo);
        },

        updateAdminPermissions = function(adminId, updateDo){
            return dbProvider.updateAdminPermissions(adminId, updateDo);
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
        createAdminAuthToken = function(token){
            return dbProvider.createAdminAuthToken(token);
        },
        updateAdminAuthToken = function(token, updateDo){
            return dbProvider.updateAdminAuthToken(token,updateDo);
        },

        //Tenant
        findTenantById = function(tenantId){
            return dbProvider.findTenantById(tenantId);
        },
        loadTenants = function(numberOfPage, pageNumber, filter){
            return dbProvider.loadTenants(numberOfPage, pageNumber, filter);
        },
        upsertTenant = function(tenant){
            return dbProvider.upsertTenant(tenant);
        },
        updateTenant = function(tenantId, updateDo){
            return dbProvider.updateTenant(tenantId, updateDo);
        },

        //Affiliate
        createAffiliate = function(affiliateDo){
            return dbProvider.createAffiliate(affiliateDo);
        },
        updateAffiliate = function(affiliateId, updateDo){
            return dbProvider.updateAffiliate(affiliateId, updateDo);
        },
        findAffiliateById = function(affiliateId){
            return dbProvider.findAffiliateById(affiliateId);
        },
        loadAffiliates = function(filter, numberOfPage, pageNumber, sort) {
            return dbProvider.loadAffiliates(filter, numberOfPage, pageNumber, sort);
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
        updateActionByKey = function(actionKey, updateDo){
            return dbProvider.updateActionByKey(actionKey, updateDo);
        },
        findActionByKey = function(actionKey){
            return dbProvider.findActionByKey(actionKey);
        },
        loadActions = function(filter, numberOfPage, pageNumber){
            return dbProvider.loadActions(filter, numberOfPage, pageNumber);
        },

        //Posts
        createPost = function(postDo){
            return dbProvider.createPost(postDo);
        },
        updatePost = function(postId, updateDo){
            return dbProvider.updatePost(postId, updateDo);
        },
        findPostById = function(postId){
            return dbProvider.findPostById(postId);
        },
        loadPosts = function(filter, numberOfPage, pageNumber, sort) {
            return dbProvider.loadPosts(filter, numberOfPage, pageNumber, sort);
        };



    return {
        insertApiCallLog                    : insertApiCallLog,
        createNewConsumerPostLog            : createNewConsumerPostLog,

        loadAdminAccounts                   : loadAdminAccounts,
        findAdminAccountById                : findAdminAccountById,
        findAdminAccountByEmail             : findAdminAccountByEmail,
        findAdminAccountByUsername          : findAdminAccountByUsername,
        findAdminAccountByTenantAndEmail    : findAdminAccountByTenantAndEmail,
        findAdminAccountByTenantAndUsername : findAdminAccountByTenantAndUsername,
        upsertAdminAccount                  : upsertAdminAccount,
        updateAdminAccount                  : updateAdminAccount,

        //Admin Authorizations
        findAdminAuthorizationsByAdminId    : findAdminAuthorizationsByAdminId,
        createAdminPermissions              : createAdminPermissions,
        updateAdminPermissionsById          : updateAdminPermissionsById,
        updateAdminPermissions              : updateAdminPermissions,

        findAppAccountByAppKey              : findAppAccountByAppKey,
        upsertAppAccountByAppkey            : upsertAppAccountByAppkey,

        findAdminAuthTokenByToken           : findAdminAuthTokenByToken,
        createAdminAuthToken                : createAdminAuthToken,
        updateAdminAuthToken                : updateAdminAuthToken,

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
        updateActionByKey                   : updateActionByKey,
        findActionById                      : findActionById,
        findActionByKey                     : findActionByKey,
        loadActions                         : loadActions,

        //Posts
        createPost                          : createPost,
        updatePost                          : updatePost,
        findPostById                        : findPostById,
        loadPosts                           : loadPosts
    };
};

