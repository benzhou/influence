var util = require("util");

(function(){
    module.exports = function(helpers){
        var hasPermissionForApp = function(permTable, actionKey){
            if(!permTable || !actionKey) return false;

            return permTable.all.actions || permTable.actions[actionKey] || false;
        },
            hasPermissionForTenant = function(permTable, tenantId, actionKey){
                if(!permTable || !tenantId ||!actionKey) return false;

                if(permTable.all.tenants){
                    if(permTable.all.actions){
                        return true;
                    }else{
                        return permTable.actions[actionKey] || false;
                    }
                }else{
                    return permTable.tenants["TENANT_ID_" + tenantId] &&
                        (permTable.tenants["TENANT_ID_" + tenantId].all.actions ||
                            permTable.tenants["TENANT_ID_" + tenantId].actions[actionKey] || false);
                }
            },
            hasPermissionForTenantAffiliate = function(permTable, tenantId, affiliateId, actionKey){
                if(!permTable || !tenantId || !affiliateId || !actionKey) return false;

                if(permTable.all.tenants){
                    if(permTable.all.actions){
                        return true;
                    }else{
                        return permTable.actions[actionKey] || false;
                    }
                }else{
                    var tenantPermTable = permTable.tenants["TENANT_ID_" + tenantId];

                    if(!tenantPermTable) return false;
                    if(tenantPermTable.all.affiliates){
                        if(tenantPermTable.all.actions){
                            return true;
                        }else{
                            return tenantPermTable.actions[actionKey];
                        }
                    }else{
                        var affiliatePermTable = tenantPermTable.affiliates["AFFILIATE_ID_" + affiliateId];
                        return  affiliatePermTable && (affiliatePermTable.all.actions || affiliatePermTable.actions[actionKey] || false);
                    }
                }

            },
            getTenantsWithActions = function(permTable, actionKeys){
                if(!permTable || !actionKeys) return [];

                if(permTable.all.tenants){
                    if(permTable.all.actions){
                        return true;
                    }else{
                        if(util.isArray(actionKeys)){
                            var notContainAllAction = actionKeys.some(function(actionKey){
                                return permTable.actions[actionKey] ? false : true;
                            });

                            return !notContainAllAction ? true : [];
                        }else{
                            return  permTable.actions[actionKeys] ? true : [];
                        }
                    }
                }else{
                    var tenantIds = [];
                    for(var prop in permTable.tenants){
                        if(permTable.tenants.hasOwnProperty(prop)){
                            if(permTable.tenants[prop].all.actions){
                                tenantIds.push(permTable.tenant[prop].tenantId);
                            }else{
                                if(util.isArray(actionKeys)){
                                    var notContainAllAction = actionKeys.some(function(actionKey){
                                        return permTable.tenants[prop].actions[actionKey] ? false : true;
                                    });

                                    if(!notContainAllAction){
                                        tenantIds.push(permTable.tenant[prop].tenantId);
                                    }
                                }else{
                                    if(permTable.tenants[prop].actions[actionKeys]){
                                        tenantIds.push(permTable.tenant[prop].tenantId);
                                    }
                                }
                            }
                        }
                    }

                    return tenantIds;
                }
            },
            getTenantAffiliatesWithActions = function(permTable, tenantId, actionKeys){
                if(!permTable || !tenantId || !actionKeys) return [];

                if(permTable.all.tenants){
                    if(permTable.all.actions){
                        return true;
                    }else{
                        if(util.isArray(actionKeys)){
                            var notContainAllAction = actionKeys.some(function(actionKey){
                                return permTable.actions[actionKey] ? false : true;
                            });

                            return !notContainAllAction ? true : [];
                        }else{
                            return  permTable.actions[actionKeys] ? true : [];
                        }
                    }
                }else{
                    var tenant = permTable.tenants["TENANT_ID_" + tenantId];

                    if(!tenant){
                        if(tenant.all.affiliates){
                            if(tenant.all.actions){
                                return true;
                            }else{
                                if(util.isArray(actionKeys)){
                                    var notContainAllAction = actionKeys.some(function(actionKey){
                                        return tenant.actions[actionKey] ? false : true;
                                    });

                                    return !notContainAllAction ? true : [];
                                }else{
                                    return  tenant.actions[actionKeys] ? true : [];
                                }
                            }
                        }else{
                            var affiliateIds = [];

                            for(var prop in tenant.affiliates){
                                if(tenant.affiliates.hasOwnProperty(prop)){
                                    if(tenant.affiliates.all.actions){
                                        affiliateIds.push(tenant.affiliates[prop].affiliateId);
                                    }else{
                                        if(util.isArray(actionKeys)){
                                            var notContainAllAction = actionKeys.some(function(actionKey){
                                                return tenant.affiliates[prop].actions[actionKey] ? false : true;
                                            });

                                            if(!notContainAllAction){
                                                affiliateIds.push(tenant.affiliates[prop].affiliateId);
                                            }
                                        }else{
                                            if(tenant.affiliates[prop].actions[actionKeys]){
                                                affiliateIds.push(tenant.affiliates[prop].affiliateId);
                                            }
                                        }
                                    }
                                }
                            }

                            return affiliateIds;
                        }
                    }
                }
            };


        return {
            hasPermissionForApp             : hasPermissionForApp,
            hasPermissionForTenant          : hasPermissionForTenant,
            hasPermissionForTenantAffiliate : hasPermissionForTenantAffiliate,
            getTenantsWithActions           : getTenantsWithActions,
            getTenantAffiliatesWithActions  : getTenantAffiliatesWithActions
        };
    }();
})();
