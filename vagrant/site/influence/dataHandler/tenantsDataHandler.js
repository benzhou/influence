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
        };

    return {
        findTenantById                      : findTenantById,
        loadTenants                         : loadTenants,
        upsertTenant                        : upsertTenant
    };
};

