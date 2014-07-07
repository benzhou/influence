var Q = require("q"),
    util = require("util"),
    errCodes        = require('../error/errorCodes'),
    InfluenceError = require('../error/influenceError');

module.exports = function(helpers, logger, tenantsDataHandler) {

    var
        getTenantById = function(tenantId){
            var df = Q.defer();

            if(!tenantId){
                df.reject(new InfluenceError(errCodes.C_400_005_001.code));
                return df.promise;
            }

            Q.when(tenantsDataHandler.findTenantById(tenantId)).then(
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

        getTenants = function(numberOfPage, pageNumber){
            var df = Q.defer();

            //Cleaning and set defaults
            numberOfPage = numberOfPage || 10;
            pageNumber   = pageNumber || 1;

            numberOfPage = parseInt(numberOfPage);
            pageNumber = parseInt(pageNumber);

            if(isNaN(numberOfPage)){
                numberOfPage = 10;
            }

            if(isNaN(pageNumber)){
                pageNumber = 1;
            }

            Q.when(tenantsDataHandler.loadTenants(numberOfPage, pageNumber)).then(
                //
                function(tenants){
                    logger.log("tenantsBusiness.js getTenants: loadTenants promise resolved");
                    logger.log("here is the tenants object");
                    logger.log(tenants);

                    df.resolve(tenants);
                }
            ).catch(function(err){
                    logger.log("tenantsBusiness.js getTenants caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("tenantsBusiness.js getTenants done!");
                });


            return df.promise;
        },

        createTenant = function(name, createdBy){
            var df = Q.defer();

            //validation
            //required fields
            if(!name || !createdBy){
                df.reject(
                    new InfluenceError(
                        errCodes.C_400_006_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

            logger.log("createTenant, name: %s, createdBy: %s", name, createdBy);

            var

                tenant = {
                    name        : name,
                    isActive    : true,
                    createdOn   : new Date(),
                    createdBy   : createdBy,
                    updatedOn   : new Date(),
                    updatedBy   : createdBy
                };

            Q.when(tenantsDataHandler.upsertTenant(tenant)).then(
                //
                function(tenant){
                    logger.log("tenantsBusiness.js createTenant: upsertTenant promise resolved");
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
        },

        updateTenant = function(tenantId, updatedBy, name, isActive){
            var df = Q.defer();

            //validation
            //required fields
            if(!tenantId || !updatedBy){
                df.reject(
                    new InfluenceError(
                        errCodes.C_400_012_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

            //TODO params verification, e.g.
            // - name length
            // - isActive has to be bool

            logger.log("updateTenant, tenantId: %s, name: %s, isActive: %s updatedBy: %s", tenantId, name, isActive, updatedBy);


            var

                tenant = {
                    updatedOn   : new Date(),
                    updatedBy   : updatedBy
                };

            if(name){
                tenant.name = name;
            }

            if(isActive !== null){
                tenant.isActive = isActive;
            }

            Q.when(tenantsDataHandler.updateTenant(tenantId, tenant)).then(
                //
                function(tenant){
                    logger.log("tenantsBusiness.js updateTenant: tenantsDataHandler.updateTenant promise resolved");
                    logger.log("here is the tenant object");
                    logger.log(tenant);

                    df.resolve(tenant);
                }
            ).catch(function(err){
                    logger.log("tenantsBusiness.js updateTenant: caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("tenantsBusiness.js updateTenant: done!");
                });


            return df.promise;
        };

    return {
        getTenantById       : getTenantById,
        getTenants          : getTenants,
        createTenant        : createTenant,
        updateTenant        : updateTenant
    };
}