module.exports = function(dbProvider){

    var
        createAdminAuthToken = function(token){
            return dbProvider.upsertAdminAuthToken(token);
        },

        invalidateAdminAuthToken = function(tokenStr){
            return dbProvider.upsertAdminAuthToken({token : tokenStr}, {$set : {isActive : false}});
        },

        findAdminAuthTokenByToken = function(tokenStr){
            return dbProvider.findAdminAuthTokenByToken(tokenStr);
        },

        //Admin Permissions
        findAdminAuthorizationsByAdminId = function(adminId){
            return dbProvider.findAdminAuthorizationsByAdminId(adminId);
        },
        createAdminPermissions = function(permission){
            return dbProvider.createAdminPermissions(permission);
        },
        updatePermissions = function(adminId, updateDo){
            return dbProvider.updatePermissions(adminId, updateDo);
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
        };

    return {
        createAdminAuthToken        : createAdminAuthToken,
        invalidateAdminAuthToken    : invalidateAdminAuthToken,
        findAdminAuthTokenByToken   : findAdminAuthTokenByToken,

        //Admin Authorizations
        findAdminAuthorizationsByAdminId    : findAdminAuthorizationsByAdminId,
        createAdminPermissions              : createAdminPermissions,
        updatePermissions                   : updatePermissions,


        //Actions
        createAction                : createAction,
        updateAction                : updateAction,
        updateActionByKey           : updateActionByKey,
        findActionById              : findActionById,
        findActionByKey             : findActionByKey,
        loadActions                 : loadActions
    };
};

