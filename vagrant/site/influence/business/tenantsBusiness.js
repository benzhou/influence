var Q = require("q"),
    util = require("util"),
    errCodes = require('../error/errorCodes'),
    InfluenceError = require('../error/influenceError');

module.exports = function(helpers, logger, tenantsDataHandler) {

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

            Q.when(tenantsDataHandler.createAdminAuthToken(tenant)).then(
                //
                function(tenant){
                    logger.log("tenantsBusiness.js createTenant: createAdminAuthToken promise resolved");
                    logger.log("here is the tenant object");
                    logger.log(tenant);

                    df.resolve(tenant);
                }
            ).catch(function(err){
                    logger.log("tenantsBusiness.js createTenant: caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("tenantsBusiness.js createTenant: done!");
                });


            return df.promise;
        };

    return {
        getTenantById       : getTenantById,
        createTenant        : createTenant
    };
}