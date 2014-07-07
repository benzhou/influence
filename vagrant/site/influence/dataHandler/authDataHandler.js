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
        createAdminAuthToken        : createAdminAuthToken,
        invalidateAdminAuthToken    : invalidateAdminAuthToken,
        findAdminAuthTokenByToken   : findAdminAuthTokenByToken,

        //Actions
        createAction                : createAction,
        updateAction                : updateAction,
        findActionById              : findActionById,
        loadActions                 : loadActions
    };
};

