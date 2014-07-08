module.exports = function(dbProvider){

    var
        findTenantById = function(tenantId){
            return dbProvider.findTenantById(tenantId);
        },
        loadTenants = function(numberOfPage, pageNumber){
            return dbProvider.loadTenants(numberOfPage, pageNumber);
        },
        upsertTenant = function(tenant){
            return dbProvider.upsertTenant(tenant);
        },
        updateTenant = function(tenantId, updateDo){
            return dbProvider.updateTenant(tenantId, updateDo);
        },

        //Affiliate
        createAffiliate = function(actionDo){
            return dbProvider.createAffiliate(actionDo);
        },
        updateAffiliate = function(actionId, updateDo){
            return dbProvider.updateAffiliate(actionId, updateDo);
        },
        findAffiliateById = function(affiliateId){
            return dbProvider.findAffiliateById(affiliateId);
        },
        loadAffiliates = function(filter, numberOfPage, pageNumber, sort) {
            return dbProvider.loadAffiliates(filter, numberOfPage, pageNumber, sort);
        };

    return {
        findTenantById                      : findTenantById,
        loadTenants                         : loadTenants,
        upsertTenant                        : upsertTenant,
        updateTenant                        : updateTenant,

        //Affiliates
        createAffiliate                     : createAffiliate,
        updateAffiliate                     : updateAffiliate,
        findAffiliateById                   : findAffiliateById,
        loadAffiliates                      : loadAffiliates
    };
};

