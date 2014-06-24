var Q = require("q"),
    util = require("util"),
    InfluenceError = require('../error/influenceError');

module.exports = function(helpers, logger, errCodes, tenantsDataHandler) {

    var
        getTenantById = function(tenantId){
            var df = Q.defer();

            if(!tenantId){
                df.reject(new InfluenceError(errCodes.C_400_005_001.code));
                return df.promise;
            }

            Q.when(tenantsDataHandler.findTenantById(tenant)).then(
                //
                function(tenant){
                    logger.log("tenantsBusiness.js getTenantById: findTenantById promise resolved");
                    logger.log("here is the tenant object");
                    logger.log(tenant);

                    if(!tenant){
                        throw new InfluenceError(errCodes.C_400_005_002.code);
                    }

                    df.resolve(tenant);
                }
            ).catch(function(err){
                    logger.log("tenantsBusiness.js getTenantById caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("tenantsBusiness.js getTenantById done!");
                });


            return df.promise;
        },

        createTenant = function(name){
            var df = Q.defer();

            //validation
            //required fields
            if(!name){
                df.reject(
                    new InfluenceError(
                        errCodes.C_400_006_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

            logger.log("createTenant, name: %s", name);

            var

                tenant = {
                    name        : name,
                    isActive    : true,
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
        };

    return {
        getTenantById       : getTenantById
    };
}