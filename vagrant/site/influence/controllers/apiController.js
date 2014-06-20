module.exports = function(Q, logger, errCodes, authBusiness, accountBusiness){

    var test = function(req,res,next){
            res.json({result:true});
        },

        getAdminAccount = function(req,res,next){
            //TODO request validation

            var adminId = req.params.adminId;

            Q.when(accountBusiness.getAdminAccountById(adminId)).then(

                function(admin){
                    logger.log("Success when call accountBusiness.getAdminAccountById in getAdminAccount");
                    logger.log(admin);
                    res.json(admin);
                },

                function(err){
                    logger.log("Failed when call accountBusiness.getAdminAccountById in getAdminAccount");
                    logger.log(err);
                    res.json(err);
                }
            );
        },

        postAdminAccount = function(req,res,next){
            //TODO request validation

            var reqAdmin = req.body;

            //authentication/Authorization (Use middleware?)



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
                        1 //TODO Needs to retrieve from authenticated admin token
            )).then(

                function(admin){
                    logger.log("Success when call accountBusiness.createAdminAccount in postAdminAccount");
                    logger.log(admin);
                    res.json(admin);
                },

                function(err){
                    logger.log("Failed when call accountBusiness.createAdminAccount in postAdminAccount");
                    logger.log(err);
                    res.json(err);
                }
            );
        },

        getAdminAccountLogin = function(req,res,next){

            Q.when(authBusiness.adminAccountLogin(req.params.tenantId,req.params.username,req.params.password)).then(
                function(admin){
                    if(!admin){
                        res.json({
                            code : errCodes.S_500_000_001,
                            message: "System Error!"
                        });
                        return;
                    }

                    res.json({
                        code : 200,
                        message : "Login Successful"
                    });
                }
            ).catch(function(err){
                    logger.log("apiController.js getAdminAccountLogin: catch an error!");
                    logger.log(err);
                }).done(function(){
                    logger.log("apiController.js getAdminAccountLogin: done!");
                });
        },

        getAppAccount = function(req,res,next){
            //TODO request validation

            var appKey = req.params.appKey;

            Q.when(accountBusiness.getAppAccountByAppKey(appKey)).then(

                function(app){
                    logger.log("apiController.js getAppAccount: Success when call accountBusiness.getAppAccountByAppKey in getAppAccount");
                    logger.log(app);
                    res.json(app);
                },

                function(err){
                    logger.log("apiController.js getAppAccount: Failed when call accountBusiness.getAppAccountByAppKey in getAppAccount");
                    logger.log(err);
                    res.json(err);
                }
            ).done(function(){
                    logger.log("apiController.js getAppAccount: done!");
                });
        },

        postAppAccount = function(req,res,next){
            //TODO request validation

            var reqApp = req.body;

            //authentication/Authorization (Use middleware?)



            Q.when(
                accountBusiness
                    .createAppAccount(
                    reqApp.appName,
                    reqApp.appDescripion,
                    1 //TODO Needs to retrieve from authenticated admin token
                )).then(

                function(app){
                    logger.log("Success when call accountBusiness.createAppAccount in postAppAccount");
                    logger.log(app);
                    res.json(app);
                },

                function(err){
                    logger.log("Failed when call accountBusiness.createAppAccount in postAppAccount");
                    logger.log(err);
                    res.json(err);
                }
            );
        };

    return {
        test : test,
        postAdminAccount    : postAdminAccount,
        getAdminAccount     : getAdminAccount,

        getAppAccount       : getAppAccount,
        postAppAccount      : postAppAccount


    };
};

