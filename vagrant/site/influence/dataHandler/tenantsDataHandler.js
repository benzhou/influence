module.exports = function(dbProvider){

    var
        findTenantById = function(tenantId){
            return dbProvider.findTenantById(tenantId);
        },
        upsertTenant = function(tenant){
            return dbProvider.upsertTenant(tenant);
        };

    return {
        findTenantById                      : findTenantById,
        upsertTenant                        : upsertTenant
    };
};

