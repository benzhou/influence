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
            getAffiliatesWithActions = function(permTable, actionKeys, tenantId, anyActionKeys){
                if(!permTable || !tenantId || !actionKeys) return [];
                anyActionKeys = anyActionKeys || false;

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
                    var findAffiliateOfTenant = function(tenant, actionKeys, anyActionKeys){
                        if(!tenant || !actionKeys) return [];

                        anyActionKeys = anyActionKeys || false;

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
                                    var affiliate = tenant.affiliates[prop];

                                    if(affiliate.all.actions){
                                        affiliateIds.push(affiliate.affiliateId);
                                    }else{
                                        if(util.isArray(actionKeys)){
                                            var notContainAllAction = actionKeys.some(function(actionKey){
                                                return affiliate.actions[actionKey] ? false : true;
                                            });

                                            if(!notContainAllAction){
                                                affiliateIds.push(affiliate.affiliateId);
                                            }
                                        }else{
                                            if(affiliate.actions[actionKeys]){
                                                affiliateIds.push(affiliate.affiliateId);
                                            }
                                        }
                                    }
                                }
                            }

                            return affiliateIds;
                        }
                    };

                    var tenant = permTable.tenants["TENANT_ID_" + tenantId];

                    if(!tenant){ return []; }

                    return findAffiliateOfTenant(tenant, actionKeys, anyActionKeys);
                }
            },
            getTenantsIfHasAffiliateAction = function(permTable, actionKeys, anyActionKeys){
                if(!permTable || !actionKeys) return [];

                anyActionKeys = anyActionKeys || false;

                if(permTable.all.tenants){
                    if(permTable.all.actions){
                        return true;
                    }else{
                        if(util.isArray(actionKeys)){
                            if(anyActionKeys){
                                var containAnyAction = actionKeys.some(function(actionKey){
                                    return permTable.actions[actionKey] ? true : false;
                                });

                                return containAnyAction ? true : [];
                            }else{
                                var notContainAllAction = actionKeys.some(function(actionKey){
                                    return permTable.actions[actionKey] ? false : true;
                                });

                                return !notContainAllAction ? true : [];
                            }
                        }else{
                            return  permTable.actions[actionKeys] ? true : [];
                        }
                    }
                }else{
                    if(permTable.tenants) return [];

                    var tenantsArray = [];

                    for(var prop in permTable.tenants){
                        if(permTable.tenants.hasOwnProperty(prop)){
                            var tenant = permTable.tenants[prop];

                            if(tenantsArray.indexOf(tenant.tenantId) > -1){
                                break;
                            }

                            if(tenant.all.affiliates){
                                if(tenant.all.actions){
                                    tenantsArray.push(tenant.tenantId);
                                }else{
                                    if(util.isArray(actionKeys)){
                                        if(anyActionKeys){
                                            var containAnyAction = actionKeys.some(function(actionKey){
                                                return tenant.actions[actionKey] ? true : false;
                                            });

                                            if(containAnyAction){
                                                tenantsArray.push(tenant.tenantId);
                                            }
                                        }else{
                                            var notContainAllAction = actionKeys.some(function(actionKey){
                                                return tenant.actions[actionKey] ? false : true;
                                            });

                                            if(!notContainAllAction){
                                                tenantsArray.push(tenant.tenantId);
                                            }
                                        }
                                    }else{
                                        if(tenant.actions[actionKeys]){
                                            tenantsArray.push(tenant.tenantId);
                                        }
                                    }
                                }
                            }else{
                                if(tenant.affiliates){
                                    for(var prop in tenant.affiliates){
                                        if(tenant.affiliates.hasOwnProperty(prop)){
                                            var affiliate = tenant.affiliates[prop];

                                            if(tenantsArray.indexOf(tenant.tenantId) > -1){
                                                break;
                                            }

                                            if(affiliate.all.actions){
                                                tenantsArray.push(tenant.tenantId);
                                            }else{
                                                if(util.isArray(actionKeys)){
                                                    if(anyActionKeys){
                                                        var containAnyAction = actionKeys.some(function(actionKey){
                                                            return affiliate.actions[actionKey] ? true : false;
                                                        });

                                                        if(containAnyAction){
                                                            tenantsArray.push(tenant.tenantId);
                                                        }
                                                    }else{
                                                        var notContainAllAction = actionKeys.some(function(actionKey){
                                                            return affiliate.actions[actionKey] ? false : true;
                                                        });

                                                        if(!notContainAllAction){
                                                            tenantsArray.push(tenant.tenantId);
                                                        }
                                                    }
                                                }else{
                                                    if(affiliate.actions[actionKeys]){
                                                        tenantsArray.push(tenant.tenantId);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }


                        }
                    }

                    return tenantsArray;
                }
            };


        return {
            hasPermissionForApp             : hasPermissionForApp,
            hasPermissionForTenant          : hasPermissionForTenant,
            hasPermissionForTenantAffiliate : hasPermissionForTenantAffiliate,
            getTenantsWithActions           : getTenantsWithActions,
            getAffiliatesWithActions        : getAffiliatesWithActions,
            getTenantsIfHasAffiliateAction  : getTenantsIfHasAffiliateAction
        };
    }();
})();
