var Q = require("q"),
    util = require("util"),
    errorCodes    = require('../error/errorCodes'),
    InfluenceError = require('../error/influenceError');

module.exports = function(helpers, logger, tenantsDataHandler) {

    var
        getTenantById = function(tenantId){
            var df = Q.defer();

            if(!tenantId){
                df.reject(new InfluenceError(errorCodes.C_400_005_001.code));
                return df.promise;
            }

            Q.when(tenantsDataHandler.findTenantById(tenantId)).then(
                //
                function(tenant){
                    logger.log("tenantsBusiness.js getTenantById: findTenantById promise resolved");
                    logger.log("here is the tenant object");
                    logger.log(tenant);

                    if(!tenant){
                        throw new InfluenceError(errorCodes.C_400_005_002.code);
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

        getTenants = function(numberOfPage, pageNumber, filter){
            var df = Q.defer(),
                cleanedFilter;

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

            cleanedFilter = helpers.cleanSearchFilter({isActive : 1, tenantIds : 1}, filter);
            logger.log("tenantsBusiness.js getTenants");
            logger.log("cleanedFilter:");
            logger.log(cleanedFilter);

            Q.when(tenantsDataHandler.loadTenants(numberOfPage, pageNumber, cleanedFilter)).then(
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

            logger.log("createTenant, name: %s, createdBy: %s", name, createdBy);

            //validation
            //required fields
            if(!name || !createdBy){
                df.reject(
                    new InfluenceError(
                        errorCodes.C_400_006_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

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
                        errorCodes.C_400_012_001.code,
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

            if(name != null){
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
        },

        //Affiliates
        findAffiliateById = function(affiliateId){
            var df = Q.defer();

            logger.log("tenantsBusiness.js findAffiliateById, affiliateId:%s", affiliateId);
            if(!affiliateId){
                df.reject(new InfluenceError(errorCodes.C_400_018_001.code));

                return df.promise;
            }

            Q.when(tenantsDataHandler.findAffiliateById(affiliateId)).then(
                function(affiliate){
                    logger.log("tenantsBusiness.js findAffiliateById: tenantsDataHandler.findAffiliateById promise resolved");
                    logger.log("here is the affiliate object");
                    logger.log(affiliate);

                    if(!affiliate){
                        throw new InfluenceError(errorCodes.C_400_018_002.code);
                    }

                    df.resolve(affiliate);
                }
            ).catch(function(err){
                    logger.log("tenantsBusiness.js findAffiliateById caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("tenantsBusiness.js findAffiliateById done!");
                });

            return df.promise;
        },

        createAffiliate = function(name, tenantId, createdBy, location){
            var df = Q.defer();

            logger.log("createAffiliate, name: %s,tenantId:%s createdBy: %s", name, tenantId, createdBy);

            //validation
            //required fields
            if(!name || !tenantId || !createdBy){
                df.reject(new InfluenceError(errorCodes.C_400_019_001.code));

                return df.promise;
            }

            var

                affiliate = {
                    name        : name,
                    tenantId    : tenantId,
                    location    : location,
                    createdOn   : new Date(),
                    createdBy   : createdBy,
                    updatedOn   : new Date(),
                    updatedBy   : createdBy
                };

            Q.when(tenantsDataHandler.createAffiliate(affiliate)).then(
                //
                function(newAffiliates){
                    logger.log("tenantsBusiness.js createAffiliate: tenantsDataHandler.createAction promise resolved");
                    logger.log("here is the newAffiliates object");
                    logger.log(newAffiliates);

                    df.resolve(newAffiliates);
                }
            ).catch(function(err){
                    logger.log("tenantsBusiness.js createAffiliate: caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("tenantsBusiness.js createAffiliate: done!");
                });


            return df.promise;
        },

        updateAffiliate = function(affiliateId, updatedBy, name, location){
            var df = Q.defer();

            //validation
            //required fields
            if(!affiliateId || !updatedBy){
                df.reject(new InfluenceError(errorCodes.C_400_020_001.code));

                return df.promise;
            }

            //TODO params verification, e.g.
            // - name length

            logger.log("updateAffiliate, affiliateId: %s, name: %s, updatedBy: %s", affiliateId, name, updatedBy);

            var

                affiliate = {
                    updatedOn   : new Date(),
                    updatedBy   : updatedBy
                };

            if(name != null){
                affiliate.name = name;
            }

            if(location != null){
                affiliate.location = location;
            }

            Q.when(tenantsDataHandler.updateAffiliate(affiliateId, affiliate)).then(
                //
                function(newAffiliate){
                    logger.log("tenantsBusiness.js updateAffiliate: tenantsDataHandler.updateAffiliate promise resolved");
                    logger.log("here is the newAffiliate object");
                    logger.log(newAffiliate);

                    df.resolve(newAffiliate);
                }
            ).catch(function(err){
                    logger.log("tenantsBusiness.js updateAffiliate: caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("tenantsBusiness.js updateAffiliate: done!");
                });


            return df.promise;
        },

        loadAffiliates = function(filter, numberOfPage, pageNumber, sort){
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

            var cleanedFilter = helpers.cleanSearchFilter({tenantId : 1}, filter),
                cleanedSort     = helpers.cleanSort({tenantId : 1, name : 1}, sort);

            Q.when(tenantsDataHandler.loadAffiliates(cleanedFilter, numberOfPage, pageNumber, cleanedSort)).then(
                function(affiliates){
                    logger.log("tenantsBusiness.js loadAffiliates: tenantsDataHandler.loadAffiliates promise resolved");
                    logger.log("here is the affiliates object");
                    logger.log(affiliates);

                    df.resolve(affiliates);
                }
            ).catch(function(err){
                    logger.log("tenantsBusiness.js loadAffiliates caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("tenantsBusiness.js loadAffiliates done!");
                });


            return df.promise;
        };

    return {
        getTenantById           : getTenantById,
        getTenants              : getTenants,
        createTenant            : createTenant,
        updateTenant            : updateTenant,

        //Affiliates
        createAffiliate                     : createAffiliate,
        updateAffiliate                     : updateAffiliate,
        findAffiliateById                   : findAffiliateById,
        loadAffiliates                      : loadAffiliates
    };
}