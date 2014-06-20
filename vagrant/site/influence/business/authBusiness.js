module.exports = function(Q, helpers, util, logger, errCodes, accountDataHandler){

    var
        adminAccountLogin = function(tenantId, username, password){
            var df = Q.defer();

            //validation
            //required fields
            if(!tenantId || !username || !password){
                df.reject({
                    code : errCodes.C_400_002_001.code,
                    message : "Missing parameters"
                });
                return df.promise;
            }

            Q.when(accountDataHandler.findAdminAccountByTenantAndUsername(tenantId, username)).then(
                //
                function(admin){
                    logger.log("authBusiness.js adminAccountLogin: findAdminAccountByTenantAndUsername promise resolved");
                    logger.log("here is the admin object");
                    logger.log(admin);

                    if(!admin){
                        //if admin is false value, means we didn't find the admin by the tenantId and username
                        throw {
                            code : errCodes.C_400_002_002,
                            message : "Invalid Username/Password"
                        }
                    }

                    //TODO Validate retrieved admin has passwordHash and passwordSalt
                    var calculatedHash = helpers.sha256Hash(password + '.' + admin.passwordSalt);
                    logger.log("admin's saved password hash is %s", admin.passwordHash);
                    logger.log("calculated hash is %s", calculatedHash);

                    if(admin.passwordHash !== calculatedHash){
                        throw {
                            code : errCodes.C_400_002_003,
                            message : "Invalid Username/Password"
                        }
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

        getAdminLoginToken = function(appId, adminId){
            var df = Q.defer();

            return df.promise;
        };

    return {
        adminAccountLogin   : adminAccountLogin
    };
};

