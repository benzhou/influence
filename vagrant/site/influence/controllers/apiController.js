var
    Q               = require('q'),
    util            = require('util'),
    InfluenceError  = require('../error/influenceError'),
    errorCodes      = require('../error/errorCodes'),
    constants       = require('../constants/constants');

module.exports = function(logger, authBusiness, accountBusiness, tenantsBusiness, authorizationHelper){

    var test = function(req,res,next){
            logger.log("================");
            logger.log("apiController.js test action called!");
            logger.log("================");

            res.json(400, {result:true});
            next();
        },

        //Admin Account
        getAdminAccounts = function(req,res,next){
            //TODO request validation

            var tenantId = req.params.tenantId,
                sortFieldName    = req.query.sfn,
                sortFieldAscOrDesc = req.query.sad,
                permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE],
                configOptions = req.params.configOptions,
                filter = {},
                sort = {};

            Q.when((function(){
                if(sortFieldName){
                    sortFieldAscOrDesc =  sortFieldAscOrDesc == "1"? 1 : -1;
                    sort[sortFieldName] = sortFieldAscOrDesc;
                }

                if(!authorizationHelper.hasPermissionForTenant(permTable, tenantId, configOptions? constants.ACTIONS.EDIT_ADMIN : constants.ACTIONS.VIEW_ADMIN)){
                    throw new InfluenceError(errorCodes.C_401_002_002.code);
                }

                filter.tenantId = tenantId;

                return accountBusiness.loadAdminAccounts(filter, req.query.numberOfPage, req.query.pageNumber, sort);
            })()).then(
                function(admins){
                    logger.log("apiController.js getAdminAccounts accountBusiness.loadAdminAccounts fulfilled.");
                    logger.log(admins);

                    var returnAdmins = [];

                    admins.forEach(function(item){
                        returnAdmins.push(
                            {
                                id          : item._id,
                                tenantId    : item.tenantId,
                                username    : item.username,
                                email       : item.email,
                                firstName   : item.firstName,
                                lastName    : item.lastName,
                                displayName : item.displayName
                            }
                        );
                    });

                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            admins : returnAdmins
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("apiController.js getAdminAccounts caught an error!.");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }
            ).done(
                function(){
                    next();
                }
            );
        },
        getAdminAccount = function(req,res,next){
            //TODO request validation

            var adminId = req.params.adminId || req[constants.reqParams.PROP_AUTHTOKEN].adminId,
                permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE];

            Q.when(accountBusiness.getAdminAccountById(adminId)).then(
                function(admin){
                    logger.log("Success when call accountBusiness.getAdminAccountById in getAdminAccount");
                    logger.log(admin);

                    if(!admin || !authorizationHelper.hasPermissionForTenant(permTable, admin.tenantId, constants.ACTIONS.VIEW_ADMIN)){
                        throw new InfluenceError(errorCodes.C_401_002_010.code);
                    }

                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            admin : {
                                id          : admin._id,
                                tenantId    : admin.tenantId,
                                username    : admin.username,
                                email       : admin.email,
                                firstName   : admin.firstName,
                                lastName    : admin.lastName,
                                displayName : admin.displayName
                            }
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("Failed when call accountBusiness.getAdminAccountById in getAdminAccount");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }
            ).done(
                function(){
                    next();
                }
            );
        },
        postAdminAccount = function(req,res,next){
            //TODO request validation

            var reqAdmin = req.body,
                authToken = req[constants.reqParams.PROP_AUTHTOKEN],
                adminId = req.params.adminId,
                permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE],
                currentAdminId  = req[constants.reqParams.PROP_AUTHTOKEN]["adminId"];

            Q.when((function(){
                if(adminId){
                    return accountBusiness.getAdminAccountById(adminId).then(function(admin){
                        logger.log("postAdminAccount update: accountBusiness.getAdminAccountById promise is fulfilled!");
                        logger.log(admin);

                        if(!admin || !authorizationHelper.hasPermissionForTenant(permTable, admin.tenantId, constants.ACTIONS.EDIT_ADMIN)){
                            throw new InfluenceError(errorCodes.C_401_002_009.code);
                        }

                        return accountBusiness.updateAdminAccount(
                            adminId,
                            reqAdmin.username,
                            reqAdmin.email,
                            reqAdmin.firstName,
                            reqAdmin.lastName,
                            reqAdmin.displayName,
                            currentAdminId
                        );
                    });
                }else{
                    if(!authorizationHelper.hasPermissionForTenant(permTable, reqAdmin.tenantId, constants.ACTIONS.EDIT_ADMIN)){
                        throw new InfluenceError(errorCodes.C_401_002_009.code);
                    }

                    return accountBusiness.createAdminAccount(
                            reqAdmin.tenantId,
                            reqAdmin.username,
                            reqAdmin.email,
                            reqAdmin.password,
                            reqAdmin.firstName,
                            reqAdmin.lastName,
                            reqAdmin.displayName,
                            currentAdminId
                        )
                }
            })()).then(
                function(admin){
                    logger.log("postAdminAccount create or update promise is fulfilled!");
                    logger.log(admin);

                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            admin : {
                                id          : admin._id,
                                username    : admin.username,
                                email       : admin.email,
                                firstName   : admin.firstName,
                                lastName    : admin.lastName,
                                displayName : admin.displayName
                            }
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("postAdminAccount create or update caught an error!");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);

                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }
            ).done(
                function(){
                    logger.log("apiController.js postAdminAccount: done");
                    next();
                }
            );
        },

        //Admin Auth Token
        getAdminAccountLogin = function(req,res,next){

            Q.when(authBusiness.adminAccountLogin(req.query.appKey, req.params.username,req.params.password)).then(
                function(admin){
                    res.json({
                        code : errorCodes.SU_200.code,
                        data : {
                            token : {
                                token       : admin.token.token,
                                expiredOn   : admin.token.expiredOn,
                                admin       : {
                                    displayName : admin.displayName,
                                    firstName   : admin.firstName,
                                    lastName    : admin.lastName,
                                    tenantId    : admin.tenantId,
                                    username    : admin.username,
                                    email       : admin.email
                                }
                            }

                        }
                    });
                }
            ).catch(function(err){
                    logger.log("apiController.js getAdminAccountLogin: catch an error!");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }).done(function(){
                    logger.log("apiController.js getAdminAccountLogin: done!");
                    next();
                });
        },
        deleteAdminAuthToken = function(req,res,next){

            Q.when(authBusiness.invalidateAdminAuthToken(req[constants.reqParams.PROP_AUTHTOKEN].token)).then(
                function(token){
                    res.json({
                        code : errorCodes.SU_200.code,
                        data : {
                            token : {
                                token       : token.token
                            }

                        }
                    });
                }
            ).catch(function(err){
                    logger.log("apiController.js deleteAdminAuthToken: catch an error!");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }).done(function(){
                    logger.log("apiController.js deleteAdminAuthToken: done!");
                    next();
                });
        },
        getAdminAuthToken = function(req,res,next){

            Q.when(authBusiness.findAdminAuthToken(req[constants.reqParams.PROP_AUTHTOKEN])).then(
                function(admin){
                    res.json({
                        code : errorCodes.SU_200.code,
                        data : {
                            token : {
                                token       : admin.token.token,
                                expiredOn   : admin.token.expiredOn,
                                admin       : {
                                    displayName : admin.displayName,
                                    firstName   : admin.firstName,
                                    lastName    : admin.lastName,
                                    tenantId    : admin.tenantId,
                                    username    : admin.username,
                                    email       : admin.email
                                }
                            }

                        }
                    });
                }
            ).catch(function(err){
                    logger.log("apiController.js getAdminAuthToken: catch an error!");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }).done(function(){
                    logger.log("apiController.js getAdminAuthToken: done!");
                    next();
                });
        },

        //Admin Permissions
        getAdminPermissions = function(req,res,next){
            var
                permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE],
                currentAdminId  = req[constants.reqParams.PROP_AUTHTOKEN]["adminId"].toString(),
                adminId = req.params.adminId || currentAdminId;

            logger.log('apiController.js getAdminPermissions');
            logger.log(adminId);
            logger.log(currentAdminId);

            Q.when(accountBusiness.getAdminAccountById(adminId)).then(function(admin){
                if(adminId !== currentAdminId){
                    if(admin && !authorizationHelper.hasPermissionForTenant(permTable, admin.tenantId.toString(), constants.ACTIONS.VIEW_PERMISSION_ADMIN)){
                        throw new InfluenceError(errorCodes.C_401_002_003.code);
                    }
                }

                return authBusiness.findAdminAuthorizationsByAdminId(adminId);
            }).then(
                function(perms){
                    res.json({
                        code : errorCodes.SU_200.code,
                        data : {
                            permissions : perms
                        }
                    });
                }
            ).catch(function(err){
                    logger.log("apiController.js getAdminPermissions: catch an error!");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }).done(function(){
                    logger.log("apiController.js getAdminPermissions: done!");
                    next();
                });
        },
        postAdminPermissions = function(req,res,next){
            var adminIdToCreateOrUpdate = req.params.adminId,
                permissions = req.body,
                permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE],
                currentAdminId  = req[constants.reqParams.PROP_AUTHTOKEN]["adminId"];

            Q.when(accountBusiness.getAdminAccountById(adminIdToCreateOrUpdate)).then(
                function(admin){
                    if(admin && !authorizationHelper.hasPermissionForTenant(permTable, admin.tenantId.toString(), constants.ACTIONS.EDIT_PERMISSION_ADMIN)){
                        throw new InfluenceError(errorCodes.C_401_002_004.code);
                    }

                    return authBusiness.createOrUpdateAdminPermissions(adminIdToCreateOrUpdate, permissions, currentAdminId);
                }
            ).then(
                function(perms){
                    res.json({
                        code : errorCodes.SU_200.code,
                        data : {
                            permissions : perms
                        }
                    });
                }
            ).catch(function(err){
                    logger.log("apiController.js postAdminPermissions: catch an error!");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }).done(function(){
                    logger.log("apiController.js postAdminPermissions: done!");
                    next();
                });
        },

        //Tenants
        getTenants = function(req,res,next){
            var filter = {},
                activeOnly = req.query[constants.QUERY_STRING_PARAM.GET_TENANTS.ACTIVE_ONLY] || "1",
                permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE],
                configOptions = req.params.configOptions,
                tenantsAuthorized;

            //When list limited access tenants, configOption should be passed in.
            logger.log('apiController.js getTenants, configOptions:');
            logger.log(configOptions);
            if(configOptions){
                switch(configOptions.toLowerCase()){
                    case "affiliate":
                        tenantsAuthorized = authorizationHelper.getTenantsIfHasAffiliateAction(permTable, constants.ACTIONS.EDIT_AFFILIATE);
                        break;
                    case "admin":
                        tenantsAuthorized = authorizationHelper.getTenantsWithActions(permTable, constants.ACTIONS.EDIT_ADMIN);
                        break;
                    case "admin_permission":
                        tenantsAuthorized = authorizationHelper.getTenantsWithActions(permTable, constants.ACTIONS.EDIT_PERMISSION_ADMIN);
                        break;
                    case "tenant":
                        tenantsAuthorized = authorizationHelper.getTenantsWithActions(permTable, constants.ACTIONS.EDIT_TENANT);
                        break;
                    default:
                        tenantsAuthorized = [];
                        break;
                }
            }else{
                tenantsAuthorized = authorizationHelper.getTenantsWithActions(permTable, constants.ACTIONS.VIEW_TENANT);
            }

            logger.log('apiController.js getTenants, tenantsAuthorized:');
            logger.log(tenantsAuthorized);
            if(tenantsAuthorized !== true){
                filter.tenantIds = tenantsAuthorized;
            }

            //We only add filter when request asked for only show active tenants, the opposite is include all, therefore, no filter needed.
            if(activeOnly == "1"){
                filter.isActive = true;
            }


/*

            if(!permTable.all.tenants){
                filter.tenantIds = [];
                for(var prop in permTable.tenants){
                    if(permTable.tenants.hasOwnProperty(prop)){
                        filter.tenantIds.push(permTable.tenants[prop].tenantId);
                    }
                }
            }
*/

            Q.when(tenantsBusiness.getTenants(req.query.numberOfPage, req.query.pageNumber, filter)).then(
                function(tenants){
                    logger.log("apiController.js getTenants: tenantsBusiness.getTenants promise resolved.");
                    logger.log(tenants);

                    if(configOptions){
                        var tenantRet = [];

                        if(tenants && util.isArray(tenants)){
                            tenants.forEach(function(tenant){
                                tenantRet.push({
                                    id: tenant._id,
                                    name : tenant.name
                                });
                            });
                        }

                        res.json({
                            code : errorCodes.SU_200.code,
                            data : {
                                tenants : tenantRet
                            }
                        });
                    }else{
                        res.json({
                            code : errorCodes.SU_200.code,
                            data : {
                                tenants : tenants
                            }
                        });
                    }
                }
            ).catch(function(err){
                    logger.log("apiController.js getTenants: catch an error!");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }).done(function(){
                    logger.log("apiController.js getTenants: done!");
                    next();
                });
        },
        getTenant = function(req,res,next){
            var permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE];

            Q.when((function(){
                if(!authorizationHelper.hasPermissionForTenant(permTable, req.params.tenantId, constants.ACTIONS.VIEW_TENANT)){
                    throw new InfluenceError(errorCodes.C_401_002_005.code);
                }

                return tenantsBusiness.getTenantById(req.params.tenantId);
            })()).then(
                function(tenant){
                    res.json({
                        code : errorCodes.SU_200.code,
                        data : {
                            tenant : tenant
                        }
                    });
                }
            ).catch(function(err){
                    logger.log("apiController.js getTenantById: catch an error!");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }).done(function(){
                    logger.log("apiController.js getTenantById: done!");
                    next();
                });
        },
        postTenant = function(req,res,next){
            var tenantDo = req.body,
                currentAdminId  = req[constants.reqParams.PROP_AUTHTOKEN]["adminId"],
                permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE],
                tenantId = req.params.tenantId;

            Q.when((function(){
                if(tenantId){
                    if(!authorizationHelper.hasPermissionForTenant(permTable, req.params.tenantId, constants.ACTIONS.EDIT_TENANT)){
                        throw new InfluenceError(errorCodes.C_401_002_006.code);
                    }

                    return tenantsBusiness.updateTenant(
                        req.params.tenantId,
                        currentAdminId,
                        tenantDo.name,
                        tenantDo.isActive);
                }else{
                    if(!authorizationHelper.hasPermissionForApp(permTable, constants.ACTIONS.EDIT_TENANT)){
                        throw new InfluenceError(errorCodes.C_401_002_007.code);
                    }

                    return tenantsBusiness.createTenant(
                        tenantDo.name,
                        currentAdminId
                    )
                }
            })()).then(
                function(tenant){
                    res.json({
                        code : errorCodes.SU_200.code,
                        data : {
                            tenant : tenant
                        }
                    });
                }
            ).catch(function(err){
                    logger.log("apiController.js postTenant: catch an error!");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }).done(function(){
                    logger.log("apiController.js postTenant: done!");
                    next();
                });
        },
        putTenant = function(req,res,next){
            var tenantUpdateDo = req.body,
                permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE],
                currentAdminId  = req[constants.reqParams.PROP_AUTHTOKEN]["adminId"];;

            Q.when((function(){
                if(!authorizationHelper.hasPermissionForTenant(permTable, req.params.tenantId, constants.ACTIONS.EDIT_TENANT)){
                    throw new InfluenceError(errorCodes.C_401_002_011.code);
                }

                return tenantsBusiness.updateTenant(
                        req.params.tenantId,
                        currentAdminId,
                        tenantUpdateDo.name,
                        tenantUpdateDo.isActive);
            })()).then(
                function(tenant){
                    res.json({
                        code : errorCodes.SU_200.code,
                        data : {
                            tenant : tenant
                        }
                    });
                }
            ).catch(function(err){
                    logger.log("apiController.js putTenant: catch an error!");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }).done(function(){
                    logger.log("apiController.js putTenant: done!");
                    next();
                });
        },

        //Actions
        getActions = function(req,res,next){
            //TODO request validation

            //TODO: Added selected fields

            var filter = {},
                permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE];

            Q.when((function(){
                if(!authorizationHelper.hasPermissionForApp(permTable, constants.ACTIONS.VIEW_ACTIONS)){
                    throw new InfluenceError(errorCodes.C_401_002_012.code);
                }

                return authBusiness.loadActions(filter, req.params.numberOfPage, req.params.pageNumber);
            })()).then(
                function(actions){
                    logger.log("apiController.js getActions authBusiness.loadActions fulfilled.");
                    logger.log(actions);

                    var returnActions = [];

                    actions.forEach(function(item){
                        returnActions.push(
                            {
                                id          : item._id,
                                name        : item.name,
                                key         : item.key
                            }
                        );
                    });

                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            actions : returnActions
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("apiController.js getActions caught an error!.");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }
            ).done(
                function(){
                    next();
                }
            );
        },
        getAction = function(req,res,next){
            //TODO request validation
            if(!authorizationHelper.hasPermissionForApp(permTable, constants.ACTIONS.VIEW_ACTIONS)){
                throw new InfluenceError(errorCodes.C_401_002_014.code);
            }

            Q.when(authBusiness.findActionById(req.params.actionId)).then(

                function(action){
                    logger.log("apiController.js getAction authBusiness.findActionById fulfilled.");
                    logger.log(action);

                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            action : {
                                id          : action._id,
                                name        : action.name,
                                key         : action.key
                            }
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("apiController.js getAction caught an error!.");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }
            ).done(
                function(){
                    next();
                }
            );
        },
        getActionByKey = function(req,res,next){
            //TODO request validation
            if(!authorizationHelper.hasPermissionForApp(permTable, constants.ACTIONS.VIEW_ACTIONS)){
                throw new InfluenceError(errorCodes.C_401_002_013.code);
            }
            Q.when(authBusiness.findActionByKey(req.params.actionKey)).then(

                function(action){
                    logger.log("apiController.js getActionByKey authBusiness.findActionByKey fulfilled.");
                    logger.log(action);

                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            action : {
                                id          : action._id,
                                name        : action.name,
                                key         : action.key
                            }
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("apiController.js getActionByKey caught an error!.");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }
            ).done(
                function(){
                    next();
                }
            );
        },
        postAction = function(req,res,next){
            //TODO request validation

            var action = req.body,
                actionId = req.params.actionId,
                promise,
                permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE],
                currentAdminId  = req[constants.reqParams.PROP_AUTHTOKEN]["adminId"];

            Q.when((function(){
                if(!authorizationHelper.hasPermissionForApp(permTable, constants.ACTIONS.EDIT_ACTIONS)){
                    throw new InfluenceError(errorCodes.C_401_002_015.code);
                }

                if(actionId){
                    return authBusiness.updateAction(
                        actionId,
                        currentAdminId,
                        action.name,
                        action.key
                    );
                }else{
                    return authBusiness.createAction(
                            action.name,
                            action.key,
                            currentAdminId
                    );
                }
            })()).then(
                function(newAction){
                    logger.log("apiController.js postAction create or update promise is fulfilled!");
                    logger.log(newAction);

                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            action : {
                                id          : newAction._id,
                                name        : newAction.name,
                                key         : newAction.key
                            }
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("apiController.js postAction create or update caught an error!");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    logger.log(err.stack);


                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }).done(
                function(){
                    logger.log("apiController.js postAction: done");
                    next();
                }
            );
        },

        //Affiliates
        getAffiliates = function(req,res,next){
            //TODO request validation

            //TODO: Added selected fields

            var tenantId  = req.params.tenantId,
                sortFieldName    = req.query.sfn,
                sortFieldAscOrDesc = req.query.sad,
                permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE],
                configOptions = req.params.configOptions,
                affiliatesAuthorized,
                filter = {},
                sort = {};

            if(sortFieldName){
                sortFieldAscOrDesc =  sortFieldAscOrDesc == "1"? 1 : -1;
                sort[sortFieldName] = sortFieldAscOrDesc;
            }

            if(configOptions){
                switch(configOptions.toLowerCase()){
                    case "affiliate":
                        affiliatesAuthorized = authorizationHelper.getAffiliatesWithActions(permTable, constants.ACTIONS.EDIT_AFFILIATE, tenantId);
                        break;
                    default:
                        affiliatesAuthorized = [];
                        break;
                }
            }else{
                affiliatesAuthorized = authorizationHelper.getTenantsIfHasAffiliateAction(permTable,  constants.ACTIONS.VIEW_AFFILIATE, tenantId);
            }

            if(affiliatesAuthorized !== true){
                filter.affiliateId = affiliatesAuthorized;
            }
            filter.tenantId = tenantId;

            Q.when(tenantsBusiness.loadAffiliates(filter, req.query.numberOfPage, req.query.pageNumber, sort)).then(
                function(affiliates){
                    logger.log("apiController.js getAffiliates tenantsBusiness.loadAffiliates fulfilled.");
                    logger.log(affiliates);

                    var returnAffiliates = [];

                    affiliates.forEach(function(item){
                        returnAffiliates.push(
                            {
                                id          : item._id,
                                name        : item.name,
                                tenantId    : item.tenantId,
                                tenantName  : item.tenant.name,
                                location    : item.location
                            }
                        );
                    });

                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            affiliates : returnAffiliates
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("apiController.js getAffiliates caught an error!.");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }
            ).done(
                function(){
                    next();
                }
            );
        },
        getAffiliate = function(req,res,next){
            //TODO request validation
            var permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE];

            Q.when((function(){
                return tenantsBusiness.findAffiliateById(req.params.affiliateId);
            })()).then(

                function(affiliate){
                    logger.log("apiController.js getAffiliate tenantsBusiness.findAffiliateById fulfilled.");
                    logger.log(affiliate);

                    if(!authorizationHelper.hasPermissionForTenantAffiliate(permTable, affiliate.tenantId.toString(), affiliate._id.toString(), constants.ACTIONS.VIEW_AFFILIATE)){
                        throw new InfluenceError(errorCodes.C_401_002_016.code);
                    }

                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            affiliate : {
                                id          : affiliate._id,
                                name        : affiliate.name,
                                tenant      : {
                                    id      : affiliate.tenant.id,
                                    name    : affiliate.tenant.name
                                }
                            }
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("apiController.js getAffiliate caught an error!.");
                    logger.log(err.stack);
                    logger.log(err.stack);

                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }
            ).done(
                function(){
                    next();
                }
            );
        },
        postAffiliate = function(req,res,next){
            //TODO request validation

            var affiliate = req.body,
                affiliateId = req.params.affiliateId,
                permTable = req[constants.reqParams.PROP_AUTHORIZATION_TABLE],
                currentAdminId  = req[constants.reqParams.PROP_AUTHTOKEN]["adminId"];

            Q.when((function(){
                if(affiliateId){
                    return tenantsBusiness.findAffiliateById(affiliateId).then(function(existingAffiliate){
                        if(!existingAffiliate || !authorizationHelper.hasPermissionForTenantAffiliate(permTable, existingAffiliate.tenantId.toString(), affiliateId, constants.ACTIONS.EDIT_AFFILIATE)){
                            throw new InfluenceError(errorCodes.C_401_002_017.code);
                        }

                        return tenantsBusiness.updateAffiliate(
                            affiliateId,
                            currentAdminId,
                            affiliate.name
                        );
                    });
                }else{
                    if(!authorizationHelper.hasPermissionForTenant(permTable, affiliate.tenantId.toString(), constants.ACTIONS.EDIT_AFFILIATE)){
                        throw new InfluenceError(errorCodes.C_401_002_018.code);
                    }

                    return tenantsBusiness.createAffiliate(
                            affiliate.name,
                            affiliate.tenantId,
                            currentAdminId
                    );
                }
            })()).then(
                function(newAffiliate){
                    logger.log("apiController.js postAffiliate create or update promise is fulfilled!");
                    logger.log(newAffiliate);

                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            affiliate : {
                                id          : newAffiliate._id,
                                name        : newAffiliate.name
                            }
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("apiController.js postAffiliate create or update caught an error!");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);

                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }).done(
                function(){
                    logger.log("apiController.js postAffiliate: done");
                    next();
                }
            );
        },

        //App Account
        getAppAccount = function(req,res,next){
            //TODO request validation

            var appKey = req.params.appKey || req[constants.reqParams.PROP_AUTHTOKEN].appKey;

            Q.when(accountBusiness.getAppAccountByAppKey(appKey)).then(

                function(app){
                    logger.log("apiController.js getAppAccount: Success when call accountBusiness.getAppAccountByAppKey in getAppAccount");
                    logger.log(app);
                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            app : {
                                appKey      : app.appKey,
                                name        : app.name,
                                description : app.description
                            }
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("apiController.js getAppAccount: Failed when call accountBusiness.getAppAccountByAppKey in getAppAccount");
                    logger.log(err.stack);

                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }
            ).done(function(){
                    logger.log("apiController.js getAppAccount: done!");
                    next();
                }
            );
        },
        postAppAccount = function(req,res,next){
            //TODO request validation

            var reqApp = req.body,
                currentAdminId = req[constants.reqParams.PROP_AUTHTOKEN].adminId;

            Q.when(
                accountBusiness
                    .createAppAccount(
                    reqApp.name,
                    reqApp.description,
                    currentAdminId //TODO Needs to retrieve from authenticated admin token
                )).then(

                function(app){
                    logger.log("Success when call accountBusiness.createAppAccount in postAppAccount");
                    logger.log(app);

                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            app : {
                                appKey      : app.appKey,
                                name        : app.name,
                                description : app.description
                            }
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("Failed when call accountBusiness.createAppAccount in postAppAccount");
                    logger.log(err.stack);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }
            ).done(
                function(){
                    logger.log("apiController.js postAppAccount Done!");
                    next();
                }
            );
        };

    return {
        test : test,
        getAdminAccounts    : getAdminAccounts,
        postAdminAccount    : postAdminAccount,
        getAdminAccount     : getAdminAccount,
        getAdminAccountLogin: getAdminAccountLogin,

        //Admin Permissions
        getAdminPermissions : getAdminPermissions,
        postAdminPermissions: postAdminPermissions,

        getAdminAuthToken   : getAdminAuthToken,
        deleteAdminAuthToken: deleteAdminAuthToken,

        getTenants          : getTenants,
        getTenant           : getTenant,
        postTenant          : postTenant,
        putTenant           : putTenant,

        getActions          : getActions,
        getAction           : getAction,
        getActionByKey      : getActionByKey,
        postAction          : postAction,

        getAffiliates       : getAffiliates,
        getAffiliate        : getAffiliate,
        postAffiliate       : postAffiliate,

        getAppAccount       : getAppAccount,
        postAppAccount      : postAppAccount
    };
};

