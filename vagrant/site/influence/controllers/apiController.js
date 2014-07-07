var
    Q               = require('q'),
    InfluenceError  = require('../error/influenceError'),
    errorCodes      = require('../error/errorCodes'),
    constants       = require('../constants/constants');

module.exports = function(logger, authBusiness, accountBusiness, tenantsBusiness){

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

            var tenantId = req.params.tenantId;

            //TODO: Added selected fields

            Q.when(accountBusiness.loadAdminAccounts(tenantId)).then(

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
                    logger.log(err);
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

            var adminId = req.params.adminId || req[constants.reqParams.PROP_AUTHTOKEN].adminId;

            Q.when(accountBusiness.getAdminAccountById(adminId)).then(

                function(admin){
                    logger.log("Success when call accountBusiness.getAdminAccountById in getAdminAccount");
                    logger.log(admin);

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
                    logger.log(err);
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
                promise;

            var currentAdminId  = req[constants.reqParams.PROP_AUTHTOKEN]["adminId"];

            if(adminId){
                promise = accountBusiness.updateAdminAccount(
                    adminId,
                    reqAdmin.username,
                    reqAdmin.email,
                    reqAdmin.firstName,
                    reqAdmin.lastName,
                    reqAdmin.displayName,
                    currentAdminId
                );
            }else{
                promise =
                    accountBusiness
                    .createAdminAccount(
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

            Q.when(promise).then(
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
                    logger.log(err);
                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    logger.log(err);

                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }).done(
                    function(){
                        logger.log("apiController.js postAdminAccount: done");
                        next();
                    }
            );
        },

        //Admin Auth Token
        getAdminAccountLogin = function(req,res,next){

            Q.when(authBusiness.adminAccountLogin(req.query.appKey, req.params.tenantId,req.params.username,req.params.password)).then(
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
                    logger.log(err);
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
                    logger.log(err);
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
                    logger.log(err);
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

        //Tenants
        getTenants = function(req,res,next){

            Q.when(tenantsBusiness.getTenants(req.params.numberOfPage, req.params.pageNumber)).then(
                function(tenants){
                    res.json({
                        code : errorCodes.SU_200.code,
                        data : {
                            tenants : tenants
                        }
                    });
                }
            ).catch(function(err){
                    logger.log("apiController.js getTenants: catch an error!");
                    logger.log(err);
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

            Q.when(tenantsBusiness.getTenantById(req.params.tenantId)).then(
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
                    logger.log(err);
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
                tenantId = req.params.tenantId,
                promise;

            if(tenantId){
                promise = tenantsBusiness.updateTenant(
                    req.params.tenantId,
                    currentAdminId,
                    tenantDo.name,
                    tenantDo.isActive);
            }else{
                promise = tenantsBusiness.createTenant(
                    tenantDo.name,
                    currentAdminId
                )
            }


            Q.when(promise).then(
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
                    logger.log(err);
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
                currentAdminId  = req[constants.reqParams.PROP_AUTHTOKEN]["adminId"];;

            Q.when(tenantsBusiness.updateTenant(
                req.params.tenantId,
                currentAdminId,
                tenantUpdateDo.name,
                tenantUpdateDo.isActive)
            ).then(
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
                    logger.log(err);
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
                    logger.log(err);

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
                    logger.log(err);
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

        getAdminAuthToken   : getAdminAuthToken,
        deleteAdminAuthToken: deleteAdminAuthToken,

        getTenants          : getTenants,
        getTenant           : getTenant,
        postTenant          : postTenant,
        putTenant           : putTenant,

        getAppAccount       : getAppAccount,
        postAppAccount      : postAppAccount
    };
};

