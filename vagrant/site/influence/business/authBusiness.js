var  Q = require("q"),
    InfluenceError = require('../error/influenceError'),
    errorCodes      = require('../error/errorCodes');


module.exports = function(helpers, util, logger, config, accountDataHandler, authDataHandler){

    var
        adminAccountLogin = function(appKey, tenantId, username, password){
            var df = Q.defer();

            logger.log("adminAccountLogin, appKey: %s tenantId: %s, username %s, password %s", appKey, tenantId, username, password);

            //validation
            //required fields
            if(!appKey || !tenantId || !username || !password){
                df.reject(
                    new InfluenceError(
                        errorCodes.C_400_002_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

            logger.log("adminAccountLogin, tenantId: %s, username %s, password %s", tenantId, username, password);

            //TODO: Validates AppKey is authorized for this method

            Q.when(accountDataHandler.findAdminAccountByTenantAndUsername(tenantId, username)).then(
                //
                function(admin){
                    logger.log("authBusiness.js adminAccountLogin: findAdminAccountByTenantAndUsername promise resolved");
                    logger.log("here is the admin object");
                    logger.log(admin);

                    if(!admin){
                        //if admin is false value, means we didn't find the admin by the tenantId and username
                        throw new InfluenceError(
                            errorCodes.C_400_002_002.code,
                            "Invalid Username/Password"
                        );
                    }

                    //Validate retrieved admin has passwordHash and passwordSalt
                    var calculatedHash = helpers.sha256Hash(password + '.' + admin.passwordSalt);
                    logger.log("admin's saved password hash is %s", admin.passwordHash);
                    logger.log("calculated hash is %s", calculatedHash);

                    if(admin.passwordHash !== calculatedHash){
                        throw new InfluenceError(
                            errorCodes.C_400_002_003.code,
                            "Invalid Username/Password"
                        );
                    }

                    createAdminAuthToken(appKey, admin._id).then(
                        function(token){
                            logger.log("authBusiness.js adminAccountLogin createAdminAuthToken promise resolved!");

                            if(!token || !token.token){
                                throw new InfluenceError(
                                    errorCodes.C_400_002_004.code,
                                    "Unexpected error when retrieve admin auth token."
                                );
                            }

                            admin.token = token;

                            df.resolve(admin);
                        }
                    ).catch(function(err){
                            throw new InfluenceError(
                                errorCodes.C_400_002_005.code,
                                "Unable to create admin auth token."
                            );
                        }).done();
                }
            ).catch(function(err){
                    logger.log("authBusiness.js adminAccountLogin catch an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("authBusiness.js adminAccountLogin done!");
            });

            return df.promise;
        },

        createAdminAuthToken = function(appKey, adminId){
            var df = Q.defer();

            //validation
            //required fields
            if(!appKey || !adminId){
                df.reject(
                    new InfluenceError(
                        errorCodes.C_400_003_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

            logger.log("createAdminAuthToken, appKey: %s, adminId %s", appKey, adminId);

            var
                expiredOn = new Date(),
                epoch = expiredOn.setSeconds(expiredOn.getSeconds() + config.auth.tokenExpirationAddOn),
                token = {
                    token       : helpers.getUrlSafeBase64EncodedToken(),
                    adminId     : adminId,
                    appKey      : appKey,
                    isActive    : true,
                    expiredOn   : expiredOn,//new Date(expiredOn*1000),
                    createdOn   : new Date(),
                    updatedOn   : new Date()
            };

            Q.when(authDataHandler.createAdminAuthToken(token)).then(
                //
                function(token){
                    logger.log("authBusiness.js createAdminAuthToken: createAdminAuthToken promise resolved");
                    logger.log("here is the token object");
                    logger.log(token);

                    df.resolve(token);
                }
            ).catch(function(err){
                    logger.log("authBusiness.js createAdminAuthToken caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("authBusiness.js createAdminAuthToken done!");
                });


            return df.promise;
        },

        validateAdminAuthToken = function(token){
            var df = Q.defer();

            if(!token){
                df.reject(
                    new InfluenceError(
                        errorCodes.C_400_004_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

            Q.when(authDataHandler.findAdminAuthTokenByToken(token)).then(
                //
                function(token){
                    logger.log("authBusiness.js validateAdminAuthToken: findAdminAuthTokenByToken promise resolved");
                    logger.log("here is the token object");
                    logger.log(token);

                    var currentDate = new Date();

                    if(!token || !token.isActive || token.expiredOn < currentDate){
                        throw new InfluenceError(
                            !token ?
                                errorCodes.C_400_004_002.code :
                                !token.isActive ?
                                    errorCodes.C_400_004_003.code :
                                    errorCodes.C_400_004_004.code
                        );
                    }

                    df.resolve(token);
                }
            ).catch(function(err){
                    logger.log("authBusiness.js validateAdminAuthToken caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("authBusiness.js validateAdminAuthToken done!");
                });

            return df.promise;
        };

    return {
        adminAccountLogin       : adminAccountLogin,
        createAdminAuthToken    : createAdminAuthToken,
        validateAdminAuthToken  : validateAdminAuthToken
    };
};

