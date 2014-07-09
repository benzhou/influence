var  Q = require("q"),
    InfluenceError = require('../error/influenceError'),
    errorCodes      = require('../error/errorCodes'),
    permissionDataObjects = require('../dataObjects/permissions');


module.exports = function(helpers, util, logger, config, accountDataHandler, authDataHandler){

    var
        adminAccountLogin = function(appKey, tenantId, username, password){
            var df = Q.defer();

            logger.log("adminAccountLogin, appKey: %s tenantId: %s, username %s, password %s", appKey, tenantId, username, password);

            //validation
            //required fields
            if(!appKey || !tenantId || !username || !password){
                df.reject(
                    new InfluenceError(
                        errorCodes.C_400_002_001.code,
                        "Missing parameters"
                    ));

                return df.promise;
            }

            logger.log("adminAccountLogin, tenantId: %s, username %s, password %s", tenantId, username, password);

            //TODO: Validates AppKey is authorized for this method

            Q.when(accountDataHandler.findAdminAccountByTenantAndUsername(tenantId, username)).then(
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

            Q.when(accountDataHandler.getAdminAccountById(tokenObj.adminId)).then(
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
                    logger.log(err);

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

                    if(!permission){
                        throw new InfluenceError(errorCodes.C_400_022_002.code);
                    }

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

        createAdminPermissions = function(adminId, permission){
            var df = Q.defer();

            //validation
            //required fields
            if(!adminId || !permission){
                df.reject(new InfluenceError(errorCodes.C_400_023_001.code));

                return df.promise;
            }

            var newPerm = new permissionDataObjects.AppPerm(permission.actions, permission.roles);

            if(permission.tenants){
                if(!util.isArray(permission.tenants)){
                    new InfluenceError(errorCodes.C_400_023_003.code)
                }

                for(var tenant in permission.tenants){
                    //Only creates tenant level permission when at least has assigned actions or roles or affiliates
                    if(!tenant.tenantId && (tenant.actions || tenant.roles || tenant.affiliates)){
                        var tenPerm = new permissionDataObjects.TenantPerm(tenant.tenantId, tenant.actions, tenant.roles);

                        if(tenant.affiliates){
                            if(!util.isArray(tenant.affiliates)){
                                new InfluenceError(errorCodes.C_400_023_002.code)
                            }

                            for(var aff in tenant.affilaites){
                                //Only creates affiliate level permission when at least has assigned actions or roles
                                if(!aff.affiliateId && (aff.actions || aff.roles)){
                                    var affPerm = new permissionDataObjects.AffiliatePerm(aff.affiliateId, aff.actions, aff.roles);
                                    tenPerm.affiliates.push(affPerm);
                                }

                            }
                        }

                        newPerm.tenants.push(tenPerm);
                    }

                }

            }

            var
                newPerm = {
                    Actions: [], //App level
                    Roles : [],
                    Tenants : []
                },
                affiliatePerm = {
                    Affiliate_ID : "",
                    Actions : [],
                    Roles : []
                },
                TenantPerm = {
                    Tenant_ID : "",
                    Actions : [],
                    Roles : [],
                    Affiliates : []
                };


        },
        updatePermissions = function(adminId, updateDo){
            return dbProvider.updatePermissions(adminId, updateDo);
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
        createAdminPermissions              : createAdminPermissions,
        updatePermissions                   : updatePermissions,


        //Actions
        findActionById          : findActionById,
        findActionByKey         : findActionByKey,
        createAction            : createAction,
        updateAction            : updateAction,
        loadActions             : loadActions
    };
};

