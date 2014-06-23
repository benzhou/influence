var InfluenceError = require('../error/influenceError');

module.exports = function(Q, helpers, util, logger, config, errCodes, accountDataHandler){

    var
        adminAccountLogin = function(tenantId, username, password){
            var df = Q.defer();

            //validation
            //required fields
            if(!tenantId || !username || !password){
                throw new InfluenceError(
                    errCodes.C_400_002_001.code,
                    "Missing parameters"
                );
            }

            logger.log("adminAccountLogin, tenantId: %s, username %s, password %s", tenantId, username, password);

            Q.when(accountDataHandler.findAdminAccountByTenantAndUsername(tenantId, username)).then(
                //
                function(admin){
                    logger.log("authBusiness.js adminAccountLogin: findAdminAccountByTenantAndUsername promise resolved");
                    logger.log("here is the admin object");
                    logger.log(admin);

                    if(!admin){
                        //if admin is false value, means we didn't find the admin by the tenantId and username
                        throw new InfluenceError(
                            errCodes.C_400_002_002.code,
                            "Invalid Username/Password"
                        );
                    }

                    //TODO Validate retrieved admin has passwordHash and passwordSalt
                    var calculatedHash = helpers.sha256Hash(password + '.' + admin.passwordSalt);
                    logger.log("admin's saved password hash is %s", admin.passwordHash);
                    logger.log("calculated hash is %s", calculatedHash);

                    if(admin.passwordHash !== calculatedHash){
                        throw new InfluenceError(
                            errCodes.C_400_002_003.code,
                            "Invalid Username/Password"
                        );
                    }


                    df.resolve(admin);
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
                throw new InfluenceError(
                    errCodes.C_400_003_001.code,
                    "Missing parameters"
                );
            }

            logger.log("createAdminAuthToken, appId: %s, adminId %s", appId, adminId);

            var token = {
                token       : helpers.getUrlSafeBase64EncodedToken(),
                adminKey    : adminId,
                appKey      : appKey,
                isActive    : true,
                createdOn   : new Date(),
                updatedOn   : new Date()
            };

            Q.when(accountDataHandler.createAdminLoginToken(token)).then(
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
        };

    return {
        adminAccountLogin   : adminAccountLogin
    };
};

