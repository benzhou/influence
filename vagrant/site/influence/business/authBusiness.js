var  Q = require("q"),
    InfluenceError = require('../error/influenceError'),
    errorCodes      = require('../error/errorCodes'),
    permissionDataObjects = require('../dataObjects/permissions');


module.exports = function(helpers, util, logger, config, accountBusiness, authDataHandler){

    var
        adminAccountLogin = function(appKey, username, password){
            var df = Q.defer();

            logger.log("adminAccountLogin, appKey: %s, username %s, password %s", appKey, username, password);

            //validation
            //required fields
            if(!appKey || !username || !password){
                df.reject(
                    new InfluenceError(
                        errorCodes.C_400_002_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

            logger.log("adminAccountLogin, username %s, password %s", username, password);

            //TODO: Validates AppKey is authorized for this method
            Q.when(accountBusiness.findAdminAccountByUsername(username)).then(
                //
                function(admin){
                    logger.log("authBusiness.js adminAccountLogin: findAdminAccountByTenantAndUsername promise resolved");
                    logger.log("here is the admin object");
                    logger.log(admin);

                    if(!admin){
                        //if admin is false value, means we didn't find the admin by the tenantId and username
                        throw new InfluenceError(
                            errorCodes.C_400_002_002.code,
                            "Invalid Username/Password"
                        );
                    }

                    //Validate retrieved admin has passwordHash and passwordSalt
                    var calculatedHash = helpers.sha256Hash(password + '.' + admin.passwordSalt);
                    logger.log("admin's saved password hash is %s", admin.passwordHash);
                    logger.log("calculated hash is %s", calculatedHash);

                    if(admin.passwordHash !== calculatedHash){
                        throw new InfluenceError(
                            errorCodes.C_400_002_003.code,
                            "Invalid Username/Password"
                        );
                    }

                    createAdminAuthToken(appKey, admin._id).then(
                        function(token){
                            logger.log("authBusiness.js adminAccountLogin createAdminAuthToken promise resolved!");

                            if(!token || !token.token){
                                throw new InfluenceError(
                                    errorCodes.C_400_002_004.code,
                                    "Unexpected error when retrieve admin auth token."
                                );
                            }

                            admin.token = token;

                            df.resolve(admin);
                        }
                    ).catch(function(err){
                            throw new InfluenceError(
                                errorCodes.C_400_002_005.code,
                                "Unable to create admin auth token."
                            );
                        }).done();
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

        createAdminAuthToken = function(appKey, adminId){
            var df = Q.defer();

            //validation
            //required fields
            if(!appKey || !adminId){
                df.reject(
                    new InfluenceError(
                        errorCodes.C_400_003_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

            logger.log("createAdminAuthToken, appKey: %s, adminId %s", appKey, adminId);

            var
                expiredOn = new Date(),
                epoch = expiredOn.setSeconds(expiredOn.getSeconds() + config.auth.tokenExpirationAddOn),
                token = {
                    token       : helpers.getUrlSafeBase64EncodedToken(),
                    adminId     : adminId,
                    appKey      : appKey,
                    isActive    : true,
                    expiredOn   : expiredOn,//new Date(expiredOn*1000),
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
        },

        findAdminAuthToken = function(tokenObj){
            var df = Q.defer();

            if(!tokenObj || !tokenObj.token || !tokenObj.adminId){
                df.reject(
                    new InfluenceError(
                        errorCodes.C_400_011_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

            Q.when(accountBusiness.getAdminAccountById(tokenObj.adminId)).then(
                //
                function(admin){
                    logger.log("authBusiness.js findAdminAuthToken: getAdminAccountById promise resolved");
                    logger.log("here is the token object");
                    logger.log(admin);

                    var currentDate = new Date();

                    if(!admin){
                        throw new InfluenceError(errorCodes.C_400_011_002.code);
                    }

                    admin.token = tokenObj;

                    df.resolve(admin);
                }
            ).catch(function(err){
                    logger.log("authBusiness.js findAdminAuthToken caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("authBusiness.js findAdminAuthToken done!");
                });

            return df.promise;
        },

        validateAdminAuthToken = function(tokenStr){
            var df = Q.defer();

            if(!tokenStr){
                df.reject(
                    new InfluenceError(
                        errorCodes.C_400_004_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

            Q.when(authDataHandler.findAdminAuthTokenByToken(tokenStr)).then(
                //
                function(token){
                    logger.log("authBusiness.js validateAdminAuthToken: findAdminAuthTokenByToken promise resolved");
                    logger.log("here is the token object");
                    logger.log(token);

                    var currentDate = new Date();

                    if(!token || !token.isActive || token.expiredOn < currentDate){
                        throw new InfluenceError(
                            !token ?
                                errorCodes.C_400_004_002.code :
                                !token.isActive ?
                                    errorCodes.C_400_004_003.code :
                                    errorCodes.C_400_004_004.code
                        );
                    }

                    df.resolve(token);
                }
            ).catch(function(err){
                    logger.log("authBusiness.js validateAdminAuthToken caught an error!");
                    logger.log(err.stack);

                    df.reject(err);
                }).done(function(){
                    logger.log("authBusiness.js validateAdminAuthToken done!");
                });

            return df.promise;
        },

        invalidateAdminAuthToken = function(tokenStr){
            var df = Q.defer();

            if(!tokenStr){
                df.reject(
                    new InfluenceError(
                        errorCodes.C_400_010_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

            Q.when(authDataHandler.invalidateAdminAuthToken(tokenStr)).then(

                function(token){
                    logger.log("authBusiness.js invalidateAdminAuthToken: invalidateAdminAuthToken promise resolved");
                    logger.log("here is the token object");
                    logger.log(token);

                    if(!token || token.isActive){
                        throw new InfluenceError(
                            errorCodes.C_400_010_002.code
                        );
                    }

                    df.resolve(token);
                }
            ).catch(function(err){
                    logger.log("authBusiness.js invalidateAdminAuthToken caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("authBusiness.js invalidateAdminAuthToken done!");
                });

            return df.promise;
        },

        //Admin Permissions
        findAdminAuthorizationsByAdminId = function(adminId){
            var df = Q.defer();

            //validation
            //required fields
            if(!adminId){
                df.reject(
                    new InfluenceError(errorCodes.C_400_022_001.code)
                );

                return df.promise;
            }

            Q.when(authDataHandler.findAdminAuthorizationsByAdminId(adminId)).then(
                function(permission){
                    logger.log('authBusiness.findAdminAuthorizationsByAdminId authDataHandler.findAdminAuthorizationsByAdminId primise fulfilled!');

                    df.resolve(permission);
                }
            ).catch(
                function(err){
                    logger.log('authBusiness.findAdminAuthorizationsByAdminId catch block got an err:');
                    logger.log(err);

                    df.reject(err);
                }
            ).done(
                function(){
                    logger.log('authBusiness.findAdminAuthorizationsByAdminIddone block was called');
                }
            );

            return df.promise;
        },

        createOrUpdateAdminPermissions = function(adminId, permission, createdOrUpdatedBy){
            var df = Q.defer();

            logger.log("createOrUpdateAdminPermissions adminId:%s, createdOrUpdatedBy:%s", adminId, createdOrUpdatedBy);
            logger.log(permission);
            
            //validation
            //required fields
            if(!adminId || !permission || !createdOrUpdatedBy){
                df.reject(new InfluenceError(errorCodes.C_400_023_001.code));

                return df.promise;
            }

            Q.when(accountBusiness.getAdminAccountById(adminId)).then(
                function(admin){
                    logger.log('authBusiness.createOrUpdateAdminPermissions accountBusiness.getAdminAccountById promise fulfilled!');
                    if(!admin){
                        throw new InfluenceError(errorCodes.C_400_023_004.code);
                    }

                    return findAdminAuthorizationsByAdminId(adminId);
                }
            ).then(
                function(existingPermission){
                    logger.log('authBusiness.createOrUpdateAdminPermissions findAdminAuthorizationsByAdminId promise fulfilled!');
                    logger.log(existingPermission);

                    //If permissions exist, then we need to update them
                    if(existingPermission){
                        var
                            clonedExistingPerms = helpers.clone(existingPermission),
                            mergingAttrs = function(existingObj, existingAttr, newAttr){
                                if(newAttr){
                                    if(util.isArray(newAttr)){
                                        var clonedArray = helpers.clone(existingObj[existingAttr] || []),
                                        //concatDeduped = util.isArray(existingObj[existingAttr]) ? helpers.dedupArray(clonedArray.concat(newAttr)) : helpers.dedupArray(newAttr);
                                            concatDeduped = helpers.dedupArray(newAttr);

                                        if(!helpers.deepEqual(concatDeduped, existingObj[existingAttr])) {
                                            existingObj[existingAttr] = util.isArray(existingObj[existingAttr]) ?  existingObj[existingAttr] : [];
                                            while(existingObj[existingAttr].length > 0) {
                                                existingObj[existingAttr].pop();
                                            }
                                            existingObj[existingAttr].push.apply(existingObj[existingAttr],concatDeduped);
                                        }
                                    }else{
                                        if(newAttr === "*" && existingObj[existingAttr] !== newAttr){
                                            existingObj[existingAttr] = newAttr;
                                        }else{
                                            throw new InfluenceError(errorCodes.C_400_023_006.code);
                                        }
                                    }
                                }
                            };

                        mergingAttrs(existingPermission, "actions", permission.actions);
                        mergingAttrs(existingPermission, "roles", permission.roles);
                        if(permission.tenants){
                            if(!util.isArray(permission.tenants)){
                                if(permission.tenants !== "*"){
                                    throw new InfluenceError(errorCodes.C_400_023_003.code);
                                }

                                if(helpers.deepEqual(existingPermission.tenants, permission.tenants)){
                                    existingPermission.tenants = permission.tenants;
                                }
                            }else{
                                //To prevent collied tenantIds
                                var tenantsUpdatedCache = {};
                                permission.tenants.forEach(function(tenant){
                                    if(tenant.tenantId && (tenant.actions || tenant.roles || tenant.affiliates)){
                                        if(tenantsUpdatedCache["TENANT_ID_" + tenant.tenantId]){
                                            throw new InfluenceError(errorCodes.C_400_023_008.code);
                                        }

                                        var existingTenantIndex = helpers.array_indexOfObject(existingPermission.tenants, tenant, function(o1,o2){ return o1.tenantId === o2.tenantId});

                                        if(existingTenantIndex === -1){
                                            existingPermission.tenants = existingPermission.tenants || [];
                                            existingPermission.tenants.push({
                                                tenantId : tenant.tenantId
                                            });
                                            existingTenantIndex = existingPermission.tenants.length - 1;
                                        }
                                        mergingAttrs(existingPermission.tenants[existingTenantIndex], "actions", tenant.actions);
                                        mergingAttrs(existingPermission.tenants[existingTenantIndex], "roles", tenant.roles);
                                        if(tenant.affiliates){
                                            if(!util.isArray(tenant.affiliates)){
                                                if(tenant.affiliates !== "*"){
                                                    throw new InfluenceError(errorCodes.C_400_023_002.code);
                                                }

                                                if(!helpers.deepEqual(existingPermission.tenants[existingTenantIndex].affiliates, tenant.affiliates)) {
                                                    existingPermission.tenants[existingTenantIndex].affiliates = tenant.affiliates;
                                                }
                                            }else{
                                                //To prevent collied affiliateIds
                                                var affiliatesUpdatedCache = {};
                                                tenant.affiliates.forEach(function(affiliate){
                                                    if(affiliate.affiliateId && (affiliate.actions || affiliate.roles)){
                                                        if(affiliatesUpdatedCache["TENANT_ID_" + tenant.tenantId + "_AFFILIATE_ID_" + affiliate.affiliateId]){
                                                            throw new InfluenceError(errorCodes.C_400_023_009.code);
                                                        }
                                                        var existingAffiliateIndex = helpers.array_indexOfObject(existingPermission.tenants[existingTenantIndex].affiliates, affiliate, function(o1,o2){ return o1.affiliateId === o2.affiliateId});

                                                        if(existingAffiliateIndex === -1){
                                                            existingPermission.tenants[existingTenantIndex].affiliates = existingPermission.tenants[existingTenantIndex].affiliates || [];
                                                            existingPermission.tenants[existingTenantIndex].affiliates.push({
                                                                affiliateId : affiliate.affiliateId
                                                            });
                                                            existingAffiliateIndex = existingPermission.tenants[existingTenantIndex].affiliates.length - 1;
                                                        }

                                                        mergingAttrs(existingPermission.tenants[existingTenantIndex].affiliates[existingAffiliateIndex], "actions", affiliate.actions);
                                                        mergingAttrs(existingPermission.tenants[existingTenantIndex].affiliates[existingAffiliateIndex], "roles", affiliate.roles);

                                                        affiliatesUpdatedCache["TENANT_ID_" + tenant.tenantId + "_AFFILIATE_ID_" + affiliate.affiliateId] = true;
                                                    }
                                                });
                                            }
                                        }

                                        tenantsUpdatedCache["TENANT_ID_" + tenant.tenantId] = true;
                                    }
                                });
                            }
                        }

                        //Compare if anything changed
                        if(helpers.deepEqual(existingPermission, clonedExistingPerms)){
                            return existingPermission;
                        }

                        existingPermission.updatedBy = createdOrUpdatedBy;
                        existingPermission.updatedOn = new Date();
                        delete existingPermission._id;
                        delete existingPermission.adminId;
                        delete existingPermission.createdBy;
                        delete existingPermission.createdOn;

                        logger.log("====> existingPermission");
                        logger.log(existingPermission);
                        return authDataHandler.updateAdminPermissions(adminId, existingPermission);
                    }else{
                        //If no existing permissions, we need to create them
                        var newPerm = new permissionDataObjects.AppPerm(adminId, createdOrUpdatedBy, helpers.dedupArray(permission.actions), helpers.dedupArray(permission.roles));

                        if(permission.tenants){
                            if(!util.isArray(permission.tenants)){
                                if(permission.tenants !== "*"){
                                    throw new InfluenceError(errorCodes.C_400_023_003.code);
                                }

                                newPerm.tenants = "*";
                            }else{
                                newPerm.tenants = [];
                                permission.tenants.forEach(function(tenant){
                                    //Only creates tenant level permission when at least has assigned actions or roles or affiliates
                                    if(tenant.tenantId && (tenant.actions || tenant.roles || tenant.affiliates)){
                                        var tenPerm = new permissionDataObjects.TenantPerm(tenant.tenantId, helpers.dedupArray(tenant.actions), helpers.dedupArray(tenant.roles));

                                        if(tenant.affiliates){
                                            if(!util.isArray(tenant.affiliates)){
                                                throw new InfluenceError(errorCodes.C_400_023_002.code)
                                            }

                                            tenPerm.affiliates = [];
                                            tenant.affiliates.forEach(function(aff){
                                                //Only creates affiliate level permission when at least has assigned actions or roles
                                                if(aff.affiliateId && (aff.actions || aff.roles)){
                                                    var affPerm = new permissionDataObjects.AffiliatePerm(aff.affiliateId, helpers.dedupArray(aff.actions), helpers.dedupArray(aff.roles));
                                                    tenPerm.affiliates.push(affPerm);
                                                }
                                            });
                                        }

                                        //Only add Tenant if it has valid permission setup
                                        if(tenPerm.affiliates.length > 0 || tenPerm.roles.length > 0 || tenPerm.actions.length > 0){
                                            newPerm.tenants.push(tenPerm);
                                        }
                                    } //End of if(!tenant.tenantId && (tenant.actions || tenant.roles || tenant.affiliates)){
                                });
                            }
                        }//End of if(permission.tenants){

                        logger.log("====> newPerm");
                        logger.log(newPerm);
                        if(newPerm.roles.length === 0 && newPerm.actions.length === 0 && newPerm.tenants.length === 0){
                            throw new InfluenceError(errorCodes.C_400_023_005.code);
                        }

                        return authDataHandler.createAdminPermissions(newPerm);
                    }
                }
            ).then(
                function(updatedOrCreatedPermission){
                    logger.log('authBusiness.createOrUpdateAdminPermissions authDataHandler.createAdminPermissions promise fulfilled!');
                    logger.log(updatedOrCreatedPermission);

                    df.resolve(updatedOrCreatedPermission);
                }
            ).catch(
                function(err){
                    logger.log('authBusiness.createOrUpdateAdminPermissions catch block got an err:');
                    logger.log(err);

                    df.reject(err);
                }
            ).done(
                function(){
                    logger.log('authBusiness.createOrUpdateAdminPermissions finally was called');
                }
            );


            return df.promise;
        },

        //Actions
        findActionById = function(actionId){
            var df = Q.defer();

            if(!actionId){
                df.reject(new InfluenceError(errorCodes.C_400_015_001.code));

                return df.promise;
            }

            Q.when(authDataHandler.findActionById(actionId)).then(
                //
                function(action){
                    logger.log("authBusiness.js findActionById: findActionById promise resolved");
                    logger.log("here is the token object");
                    logger.log(action);

                    if(!action){
                        throw new InfluenceError(errorCodes.C_400_015_002.code);
                    }

                    df.resolve(action);
                }
            ).catch(function(err){
                    logger.log("authBusiness.js findActionById caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("authBusiness.js findActionById done!");
                });

            return df.promise;
        },

        findActionByKey = function(actionKey){
            var df = Q.defer();

            if(!actionKey){
                df.reject(new InfluenceError(errorCodes.C_400_021_001.code));

                return df.promise;
            }

            Q.when(authDataHandler.findActionByKey(actionKey)).then(
                function(action){
                    logger.log("authBusiness.js findActionByKey: findActionByKey promise resolved");
                    logger.log("here is the action object");
                    logger.log(action);

                    if(!action){
                        throw new InfluenceError(errorCodes.C_400_021_002.code);
                    }

                    df.resolve(action);
                }
            ).catch(
                function(err){
                    logger.log("authBusiness.js findActionByKey caught an error!");
                    logger.log(err);

                    df.reject(err);
                }
            ).done(
                function(){
                    logger.log("authBusiness.js findActionByKey done!");
                }
            );

            return df.promise;
        },

        createAction = function(name, key, createdBy){
            var df = Q.defer();

            //validation
            //required fields
            if(!name || !key || !createdBy){
                df.reject(new InfluenceError(errorCodes.C_400_016_001.code));

                return df.promise;
            }

            logger.log("createAction, name: %s, key:%s createdBy: %s", name, key, createdBy);

            Q.when(authDataHandler.findActionByKey(key)).then(
                //
                function(existingAction){
                    logger.log("authBusiness.js createAction: findActionByKey promise resolved");
                    logger.log("here is the existingAction object");
                    logger.log(existingAction);

                    if(existingAction){
                        throw new InfluenceError(errorCodes.C_400_016_002.code);
                    }

                    var

                        action = {
                            name        : name,
                            key         : key,
                            createdOn   : new Date(),
                            createdBy   : createdBy,
                            updatedOn   : new Date(),
                            updatedBy   : createdBy
                        };

                    return authDataHandler.createAction(action);
                }
            ).then(
                function(newAction){
                    logger.log("authBusiness.js createAction: authDataHandler.createAction promise resolved");
                    logger.log("here is the newAction object");
                    logger.log(newAction);

                    df.resolve(newAction);
                }
            ).catch(function(err){
                    logger.log("authBusiness.js createAction: caught an error!");
                    logger.log(err);

                    df.reject(err);
                }
            ).done(function(){
                    logger.log("authBusiness.js createAction: done!");
                }
            );

            return df.promise;
        },

        updateAction = function(actionId, updatedBy, name, key){
            var df = Q.defer(),
                findKeyPromise;

            //validation
            //required fields
            if(!actionId || !updatedBy){
                df.reject(new InfluenceError(errorCodes.C_400_017_001.code));

                return df.promise;
            }

            //TODO params verification, e.g.
            // - name length

            logger.log("updateAction, actionId: %s, name: %s, key:%s, updatedBy: %s", actionId, name, key, updatedBy);

            //When updating key, we need to ensure the uniqueness of the key in the system
            if(key){
                findKeyPromise = authDataHandler.findActionByKey(key);
            }else{
                findKeyPromise = null;
            }

            Q.when(findKeyPromise).then(
                function(ExistingAction){
                    logger.log("authBusiness.js updateAction: authDataHandler.findActionByKey promise fulfilled.");
                    logger.log(ExistingAction);

                    //If the key already exists, then need to reject
                    if(ExistingAction && ExistingAction._id.toString() !== actionId){
                        throw new InfluenceError(errorCodes.C_400_017_002.code);
                    }

                    var

                        action = {
                            updatedOn   : new Date(),
                            updatedBy   : updatedBy
                        };

                    //As long as name is null, even if it is an empty string, we will update it
                    if(name != null){
                        action.name = name;
                    }

                    if(key){
                        action.key = key;
                    }

                    return authDataHandler.updateAction(actionId, action);
                }
            ).then(
                //
                function(newAction){
                    logger.log("authBusiness.js updateAction: authDataHandler.updateAction promise resolved");
                    logger.log("here is the new action object");
                    logger.log(newAction);

                    df.resolve(newAction);
                }
            ).catch(function(err){
                    logger.log("authBusiness.js updateAction: caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("authBusiness.js updateAction: done!");
                });


            return df.promise;
        },

        loadActions = function(filter, numberOfPage, pageNumber){
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

            var cleanedFilter = helpers.cleanSearchFilter({name : 1}, filter);

            Q.when(authDataHandler.loadActions(cleanedFilter, numberOfPage, pageNumber)).then(
                //
                function(actions){
                    logger.log("authBusiness.js loadActions: authDataHandler.loadActions promise resolved");
                    logger.log("here is the actions object");
                    logger.log(actions);

                    df.resolve(actions);
                }
            ).catch(function(err){
                    logger.log("authBusiness.js loadActions caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("authBusiness.js loadActions done!");
                });


            return df.promise;
        };

    return {
        adminAccountLogin       : adminAccountLogin,
        createAdminAuthToken    : createAdminAuthToken,
        findAdminAuthToken      : findAdminAuthToken,
        validateAdminAuthToken  : validateAdminAuthToken,
        invalidateAdminAuthToken: invalidateAdminAuthToken,

        //Admin Authorizations
        findAdminAuthorizationsByAdminId    : findAdminAuthorizationsByAdminId,
        createOrUpdateAdminPermissions      : createOrUpdateAdminPermissions,


        //Actions
        findActionById          : findActionById,
        findActionByKey         : findActionByKey,
        createAction            : createAction,
        updateAction            : updateAction,
        loadActions             : loadActions
    };
};

