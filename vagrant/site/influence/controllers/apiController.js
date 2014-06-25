var InfluenceError  = require('../error/influenceError'),
    errorCodes      = require('../error/errorCodes'),
    constants       = require('../constants/constants');

module.exports = function(Q, logger, authBusiness, accountBusiness){

    var test = function(req,res,next){
            res.json({result:true});
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
                                username    : admin.username,
                                email       : admin.email,
                                firstname   : admin.firstname,
                                lastname    : admin.lastname,
                                displayName : admin.displayName
                            }
                        }
                    });
                },

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
            );
        },

        postAdminAccount = function(req,res,next){
            //TODO request validation

            var reqAdmin = req.body,
                currentAdminId  = req[constants.reqParams.PROP_AUTHTOKEN].adminId;

            Q.when(
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
            )).then(

                function(admin){
                    logger.log("Success when call accountBusiness.createAdminAccount in postAdminAccount");
                    logger.log(admin);

                    res.json({
                        code    : errorCodes.SU_200.code,
                        message : errorCodes.SU_200.message,
                        data    : {
                            admin : {
                                id          : admin._id,
                                username    : admin.username,
                                email       : admin.email,
                                firstname   : admin.firstname,
                                lastname    : admin.lastname,
                                displayName : admin.displayName
                            }
                        }
                    });
                }
            ).catch(
                function(err){
                    logger.log("Failed when call accountBusiness.createAdminAccount in postAdminAccount");
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

                }).done(function(){logger.log("apiController.js postAdminAccount: done");});
        },

        getAdminAccountLogin = function(req,res,next){

            Q.when(authBusiness.adminAccountLogin(req.query.appKey, req.params.tenantId,req.params.username,req.params.password)).then(
                function(admin){
                    if(!admin){
                        res.json({
                            code : errorCodes.S_500_000_001,
                            message: "System Error!"
                        });
                        return;
                    }

                    res.json({
                        code : errorCodes.SU_200.code,
                        data : {
                            token : {
                                token       : admin.token.token,
                                expiredOn   : admin.token.expiredOn
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
                },

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
                });
        },

        postAppAccount = function(req,res,next){
            //TODO request validation

            var reqApp = req.body,
                currentAdminId = req[constants.reqParams.PROP_AUTHTOKEN];

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
                },

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
            );
        };

    return {
        test : test,
        postAdminAccount    : postAdminAccount,
        getAdminAccount     : getAdminAccount,
        getAdminAccountLogin: getAdminAccountLogin,

        getAppAccount       : getAppAccount,
        postAppAccount      : postAppAccount


    };
};

