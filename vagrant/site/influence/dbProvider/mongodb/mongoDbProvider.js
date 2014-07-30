"use strict";

var Q = require("q"),
    util = require("util"),
    constants       = require('../constants/constants');

module.exports = function(config, MongoDb, logger){

    var mongoClient = MongoDb.MongoClient,
        collections = {
            AdminAccount        : "AdminAccount",
            AppAccount          : "AppAccount",
            AdminAuthToken      : "AdminAuthToken",
            Tenants             : "Tenants",
            APICallLog          : "APICallLog",
            Actions             : "Actions",
            Affiliates          : "Affiliates",
            Posts               : "Posts",
            AdminAuthorizations : "AdminAuthorizations"
        },
        db = null,
        connectionDefer = null,

        connect = function(){
            //If db is non-false value or promise is non-false value
            //it means has connected
            if(db && connectionDefer){
                return connectionDefer.promise;
            }

            connectionDefer = Q.defer();
            db = null;

            logger.log("start to connect mongo ...");
            mongoClient.connect(config.connectionString, {
                db: {w: 1},
                server: {
                    'auto_reconnect': true,
                    'poolSize': config.poolSize
                }
            }, function (err, _db) {
                if (err) {
                    logger.log('mongoDbProvider.js: Database connection failed to initialize');
                    logger.log("mongoDbProvider.js: error", err);
                    process.exit(1);
                    connectionDefer.reject(new Error("Systems error..."));
                    return;
                }
                db = _db;
                logger.log('Database connection initialized');
                connectionDefer.resolve(db);
            });

            return connectionDefer.promise;
        },

        close = function(forceClose){
            var df = Q.defer();

            if (db) {
                var args = [];
                args.push(function(err, result){
                    //null-fy db variable once it is closed
                    db = null;

                    _rejectOrResolve(df, err, result);
                });

                if(forceClose) args.push(forceClose);

                db.close.apply(this, args);
            }

            connectionDefer = null;
            return df.promise;
        },

        //API Call Log CURD
        insertApiCallLog = function(apiCallLog){
            return _insertNew(collections.APICallLog, apiCallLog);
        },

        //Admin Account CURD
        loadAdminAccounts = function(filter, numberOfPage, pageNumber, sort){
            numberOfPage = numberOfPage || 10;
            pageNumber = pageNumber || 1;

            var
                skip = (pageNumber - 1) * numberOfPage,
                limits = numberOfPage,
                opts = {
                    skip : skip,
                    limits : limits
                };

            filter = filter || {};
            if(sort){
                opts.sort = sort;
            }

            _convertFilterObjectId(filter, "tenantId");

            logger.log("MongoDbProvider.js loadAdminAccounts");
            logger.log(filter);
            logger.log(sort);
            logger.log("skip %s, limits:%s", skip, limits);

            return  _find(collections.AdminAccount, filter, opts);
        },
        findAdminAccountById = function(adminId){
            if(!(adminId instanceof MongoDb.ObjectID)){
                adminId = new MongoDb.ObjectID(adminId);
            }
            return  _findOneBy(collections.AdminAccount, {_id : adminId});
        },
        findAdminAccountByEmail = function(email){
            return  _findOneBy(collections.AdminAccount, {email : email});
        },
        findAdminAccountByUsername = function(username){
            return  _findOneBy(collections.AdminAccount, {username : username});
        },
        findAdminAccountByTenantAndEmail = function(tenantId, email){
            if(!(tenantId instanceof MongoDb.ObjectID)){
                tenantId = new MongoDb.ObjectID(tenantId);
            }

            return  _findOneBy(collections.AdminAccount, {tenantId: tenantId, email : email});
        },
        findAdminAccountByTenantAndUsername = function(tenantId, username){
            if(!(tenantId instanceof MongoDb.ObjectID)){
                tenantId = new MongoDb.ObjectID(tenantId);
            }

            return  _findOneBy(collections.AdminAccount, {tenantId: tenantId, username : username});
        },
        upsertAdminAccount = function(adminDo){
            if(adminDo.tenantId && !(adminDo.tenantId instanceof MongoDb.ObjectID)){
                adminDo.tenantId = new MongoDb.ObjectID(adminDo.tenantId);
            }
            if(adminDo.createdBy && !(adminDo.createdBy instanceof MongoDb.ObjectID)){
                adminDo.createdBy = new MongoDb.ObjectID(adminDo.createdBy);
            }
            if(adminDo.updatedBy && !(adminDo.updatedBy instanceof MongoDb.ObjectID)){
                adminDo.updatedBy = new MongoDb.ObjectID(adminDo.updatedBy);
            }

            return _insertNew(collections.AdminAccount, adminDo);
        },
        updateAdminAccount = function(adminId, updateDo){
            if(!(adminId instanceof MongoDb.ObjectID)){
                adminId = new MongoDb.ObjectID(adminId);
            }
            if(updateDo.updatedBy && !(updateDo.updatedBy instanceof MongoDb.ObjectID)){
                updateDo.updatedBy = new MongoDb.ObjectID(updateDo.updatedBy);
            }
            return _upsertByMatch(collections.AdminAccount, {}, {_id : adminId}, {$set: updateDo});
        },

        //App Account CURD
        findAppAccountByAppKey = function(appKey){
            return _findOneBy(collections.AppAccount, {appKey : appKey});
        },
        upsertAppAccountByAppkey = function(appDo){
            if(appDo.createdBy && !(appDo.createdBy instanceof MongoDb.ObjectID)){
                appDo.createdBy = new MongoDb.ObjectID(appDo.createdBy);
            }
            if(appDo.updatedBy && !(appDo.updatedBy instanceof MongoDb.ObjectID)){
                appDo.updatedBy = new MongoDb.ObjectID(appDo.updatedBy);
            }
            return _upsertByMatch(collections.AppAccount,{createdOn:1}, {appKey:appDo.appKey}, appDo);
        },

        //Admin Auth Token CURD
        findAdminAuthTokenByToken = function(tokenStr){
            return _findOneBy(collections.AdminAuthToken, {token : tokenStr});
        },
        upsertAdminAuthToken = function(token, updateObj){
            if(updateObj.createdBy && !(updateObj.createdBy instanceof MongoDb.ObjectID)){
                updateObj.createdBy = new MongoDb.ObjectID(updateObj.createdBy);
            }
            if(updateObj.updatedBy && !(updateObj.updatedBy instanceof MongoDb.ObjectID)){
                updateObj.updatedBy = new MongoDb.ObjectID(updateObj.updatedBy);
            }
            return _upsertByMatch(collections.AdminAuthToken, {createdOn:1}, {token:token.token}, updateObj || token);
        },

        //Admin Permissions
        findAdminAuthorizationsByAdminId = function(adminId){
            adminId = new MongoDb.ObjectID(adminId);
            return  _findOneBy(collections.AdminAuthorizations, {adminId : adminId});
        },
        createAdminPermissions = function(permission){
            if(!(permission.adminId instanceof MongoDb.ObjectID)){
                permission.adminId = new MongoDb.ObjectID(permission.adminId);
            }

            if(permission.tenants && util.isArray(permission.tenants)){
                for(var tenant in permission.tenants){
                    if(!(tenant.tenantId instanceof MongoDb.ObjectID)){
                        tenant.tenantId = new MongoDb.ObjectID(tenant.tenantId);
                    }

                    if(tenant.affiliates && util.isArray(tenant.affiliates)){
                        for(var affiliate in tenant.affiliates){
                            if(!(affiliate.affiliateId instanceof MongoDb.ObjectID)){
                                affiliate.affiliateId = new MongoDb.ObjectID(affiliate.affiliateId);
                            }
                        }
                    }
                }
            }

            return _insertNew(collections.AdminAuthorizations, permission);
        },
        updateAdminPermissionsById = function(id, updateDo){
            if(!(id instanceof MongoDb.ObjectID)){
                id = new MongoDb.ObjectID(id);
            }
            if(permission.tenants && util.isArray(permission.tenants)){
                for(var tenant in permission.tenants){
                    if(!(tenant.tenantId instanceof MongoDb.ObjectID)){
                        tenant.tenantId = new MongoDb.ObjectID(tenant.tenantId);
                    }

                    if(tenant.affiliates && util.isArray(tenant.affiliates)){
                        for(var affiliate in tenant.affiliates){
                            if(!(affiliate.affiliateId  instanceof MongoDb.ObjectID)){
                                affiliate.affiliateId  = new MongoDb.ObjectID(affiliate.affiliateId );
                            }
                        }
                    }
                }
            }
            return _upsertByMatch(collections.AdminAuthorizations, {}, {_id : id}, {$set: updateDo});
        },
        updateAdminPermissions = function(adminId, updateDo){
            if(!(adminId instanceof MongoDb.ObjectID)){
                adminId = new MongoDb.ObjectID(adminId);
            }
            if(updateDo.tenants && util.isArray(updateDo.tenants)){
                for(var tenant in updateDo.tenants){
                    if(!(tenant.tenantId instanceof MongoDb.ObjectID)){
                        tenant.tenantId = new MongoDb.ObjectID(tenant.tenantId);
                    }

                    if(tenant.affiliates && util.isArray(tenant.affiliates)){
                        for(var affiliate in tenant.affiliates){
                            if(!(affiliate.affiliateId  instanceof MongoDb.ObjectID)){
                                affiliate.affiliateId  = new MongoDb.ObjectID(affiliate.affiliateId );
                            }
                        }
                    }
                }
            }
            return _upsertByMatch(collections.AdminAuthorizations, {}, {adminId : new MongoDb.ObjectID(adminId)}, {$set: updateDo});
        },

        //Tenants
        findTenantById = function(tenantId){
            if(!(tenantId instanceof MongoDb.ObjectID)){
                tenantId = new MongoDb.ObjectID(tenantId);
            }
            return  _findOneBy(collections.Tenants, {_id : tenantId});
        },
        upsertTenant = function(tenant){
            if(tenant.createdBy && !(tenant.createdBy instanceof MongoDb.ObjectID)){
                tenant.createdBy = new MongoDb.ObjectID(tenant.createdBy);
            }
            if(tenant.updatedBy && !(tenant.updatedBy instanceof MongoDb.ObjectID)){
                tenant.updatedBy = new MongoDb.ObjectID(tenant.updatedBy);
            }

            return _insertNew(collections.Tenants, tenant);
        },
        updateTenant = function(tenantId, updateDo){
            if(tenantId && !(tenantId instanceof MongoDb.ObjectID)){
                tenantId = new MongoDb.ObjectID(tenantId);
            }
            if(updateDo.updatedBy && !(updateDo.updatedBy instanceof MongoDb.ObjectID)){
                updateDo.updatedBy = new MongoDb.ObjectID(updateDo.updatedBy);
            }
            return _upsertByMatch(collections.Tenants, {}, {_id : tenantId}, {$set: updateDo});
        },
        loadTenants = function(numberOfPage, pageNumber, filter){
            numberOfPage = numberOfPage || 10;
            pageNumber = pageNumber || 1;

            var
                skip = (pageNumber - 1) * numberOfPage,
                limits = numberOfPage,
                opts = {
                    skip : skip,
                    limits : limits
                };

            filter = filter || {};

            _convertFilterObjectId(filter, "tenantIds", "_id");

            logger.log("MongoDBProvider.js loadTenants, filer:");
            logger.log(filter);

            return  _find(collections.Tenants, filter, opts);
        },

        //Affiliates
        createAffiliate = function(affiliateDo){
            if(affiliateDo.tenantId && !(affiliateDo.tenantId instanceof MongoDb.ObjectID)){
                affiliateDo.tenantId = new MongoDb.ObjectID(affiliateDo.tenantId);
            }

            if(affiliateDo.createdBy && !(affiliateDo.createdBy instanceof MongoDb.ObjectID)){
                affiliateDo.createdBy = new MongoDb.ObjectID(affiliateDo.createdBy);
            }

            if(affiliateDo.updatedBy && !(affiliateDo.updatedBy instanceof MongoDb.ObjectID)){
                affiliateDo.updatedBy = new MongoDb.ObjectID(affiliateDo.updatedBy);
            }

            logger.log("MongoDbProvider.js createAffiliate");
            logger.log(affiliateDo);
            return _insertNew(collections.Affiliates, affiliateDo);
        },
        updateAffiliate = function(affiliateId, updateDo){
            if(affiliateId && !(affiliateId instanceof MongoDb.ObjectID)){
                affiliateId = new MongoDb.ObjectID(affiliateId);
            }
            if(affiliateDo.updatedBy && !(affiliateDo.updatedBy instanceof MongoDb.ObjectID)){
                affiliateDo.updatedBy = new MongoDb.ObjectID(affiliateDo.updatedBy);
            }

            return _upsertByMatch(collections.Affiliates, {}, {_id : affiliateId}, {$set: updateDo});
        },
        findAffiliateById = function(affiliateId){
            if(!(affiliateId instanceof MongoDb.ObjectID)){
                affiliateId = new MongoDb.ObjectID(affiliateId);
            }
            return  _findOneBy(collections.Affiliates, {_id : affiliateId});
        },
        loadAffiliates = function(filter, numberOfPage, pageNumber, sort){
            numberOfPage = numberOfPage || 10;
            pageNumber = pageNumber || 1;

            var
                skip = (pageNumber - 1) * numberOfPage,
                limits = numberOfPage,
                opts = {
                    skip : skip,
                    limits : limits
                };

            filter = filter || {};
            if(sort){
                opts.sort = sort;
            }

            _convertFilterObjectId(filter, "tenantId");
            _convertFilterObjectId(filter, "affiliateId", "_id");

            if(filter.venueId){
                filter["externalLink.venueId"] = {"$in": filter.venueId};
                delete filter.venueId;
            }

            if(filter.exLinkType){
                filter["externalLink.externalLinkType"] = filter.exLinkType.toString();
                delete filter.exLinkType;
            }

            logger.log("MongoDbProvider.js loadAffiliates");
            logger.log(filter);
            logger.log(sort);
            logger.log("skip %s, limits:%s", skip, limits);

            return  _find(collections.Affiliates, filter, opts);
        },

        //Actions
        createAction = function(actionDo){
            if(actionDo.createdBy && !(actionDo.createdBy instanceof MongoDb.ObjectID)){
                actionDo.createdBy = new MongoDb.ObjectID(actionDo.createdBy);
            }
            if(actionDo.updatedBy && !(actionDo.updatedBy instanceof MongoDb.ObjectID)){
                actionDo.updatedBy = new MongoDb.ObjectID(actionDo.updatedBy);
            }

            return _insertNew(collections.Actions, actionDo);
        },
        updateAction = function(actionId, updateDo){
            if(actionId && !(actionId instanceof MongoDb.ObjectID)){
                actionId = new MongoDb.ObjectID(actionId);
            }
            if(updateDo.updatedBy && !(updateDo.updatedBy instanceof MongoDb.ObjectID)){
                updateDo.updatedBy = new MongoDb.ObjectID(updateDo.updatedBy);
            }
            return _upsertByMatch(collections.Actions, {}, {_id : actionId}, {$set: updateDo});
        },
        updateActionByKey = function(actionKey, updateDo){
            if(updateDo.updatedBy && !(updateDo.updatedBy instanceof MongoDb.ObjectID)){
                updateDo.updatedBy = new MongoDb.ObjectID(updateDo.updatedBy);
            }
            return _upsertByMatch(collections.Actions, {}, {key : actionKey}, {$set: updateDo});
        },
        findActionById = function(actionId){
            if(!(actionId instanceof MongoDb.ObjectID)){
                actionId = new MongoDb.ObjectID(actionId);
            }
            return  _findOneBy(collections.Actions, {_id : actionId});
        },
        findActionByKey = function(actionKey){
            return  _findOneBy(collections.Actions, {key : actionKey});
        },
        loadActions = function(filter, numberOfPage, pageNumber){
            numberOfPage = numberOfPage || 10;
            pageNumber = pageNumber || 1;

            var
                skip = (pageNumber - 1) * numberOfPage,
                limits = numberOfPage,
                opts = {
                    skip : skip,
                    limits : limits
                };

            filter = filter || {};
            return  _find(collections.Actions, filter, opts);
        },

        //Posts
        createPost = function(postDo){
            logger.log("mongoDbProvider.js createPost");
            logger.log(postDo);
            postDo.createdBy = _covertFieldToObjectId(postDo.createdBy);
            postDo.updatedBy = _covertFieldToObjectId(postDo.updatedBy);
            postDo.affiliateId = _covertFieldToObjectId(postDo.affiliateId);
            /*if(postDo.createdBy && !(postDo.createdBy instanceof MongoDb.ObjectID)){
                postDo.createdBy = new MongoDb.ObjectID(postDo.createdBy);
            }
            if(postDo.updatedBy && !(postDo.updatedBy instanceof MongoDb.ObjectID)){
                postDo.updatedBy = new MongoDb.ObjectID(postDo.updatedBy);
            }
            if(!(postDo.affiliateId instanceof MongoDb.ObjectID)){
                postDo.affiliateId = new MongoDb.ObjectID(postDo.affiliateId);
            }*/
            logger.log(postDo);

            return _insertNew(collections.Posts, postDo);
        },
        updatePost = function(postId, updateDo){
            if(!(postId instanceof MongoDb.ObjectID)){
                postId = new MongoDb.ObjectID(postId);
            }

            if(updateDo.updatedBy && !(updateDo.updatedBy instanceof MongoDb.ObjectID)){
                updateDo.updatedBy = new MongoDb.ObjectID(updateDo.updatedBy);
            }
            return _upsertByMatch(collections.Posts, {}, {_id : postId}, {$set: updateDo});
        },
        findPostById = function(postId){
            if(!(postId instanceof MongoDb.ObjectID)){
                postId = new MongoDb.ObjectID(postId);
            }
            return  _findOneBy(collections.Posts, {_id : postId});
        },
        loadPosts = function(filter, numberOfPage, pageNumber, sort) {
            numberOfPage = numberOfPage || 10;
            pageNumber = pageNumber || 1;

            var
                skip = (pageNumber - 1) * numberOfPage,
                limits = numberOfPage,
                opts = {
                    skip : skip,
                    limits : limits
                };

            filter = filter || {};
            if(sort){
                opts.sort = sort;
            }

            _convertFilterObjectId(filter, "affiliateId");

            logger.log("MongoDbProvider.js loadPosts");
            logger.log(filter);
            logger.log(sort);
            logger.log("skip %s, limits:%s", skip, limits);

            return  _find(collections.Posts, filter, opts);
        },

        //Private Helper methods
        _covertFieldToObjectId = function(field){
            if(field && field !== constants.SYSTEM_DEFAULTS.CREATED_BY && !(field instanceof MongoDb.ObjectID)){
                field = new MongoDb.ObjectID(field);
            }
            return field;
        },
        _convertFilterObjectId = function(filter, idFieldName, dbFieldName){
            dbFieldName = dbFieldName || idFieldName;
            var needToDeleteOriginalFilterField = dbFieldName !== idFieldName;

            if(filter[idFieldName]){
                if(util.isArray(filter[idFieldName])){
                    var ids = [];
                    filter[idFieldName].forEach(function(id){
                        if(!(id instanceof MongoDb.ObjectID)){
                            id = new MongoDb.ObjectID(id);
                        }
                        ids.push(id);
                    });
                    filter[dbFieldName] = { $in : ids};
                }else{
                    filter[dbFieldName] = new MongoDb.ObjectID(filter[idFieldName]);
                }

                if(needToDeleteOriginalFilterField){
                    delete filter[idFieldName];
                }
            }
        },
        _findById = function(collectionName, id){
            return _findOneBy(collectionName, {_id : id});
        },

        _findOneBy = function(collectionName, match){
            var df = Q.defer();


            Q.when(connect()).then(
                //success callback
                function(db){
                    try{
                        var collection = db.collection(collectionName);
                        logger.log('mongoDbProvider.js _findOneBy - ' + collectionName +': querying');

                        collection.findOne(
                            match,
                            function(err, result){
                                logger.log('mongoDbProvider.js  _findOneBy - ' + collectionName +': resolved!');
                                _rejectOrResolve(df, err, result);
                            }
                        );
                    }catch(e){
                        _rejectOrResolve(df, e);
                    }
                },
                //fail callback
                function(){
                    logger.log('mongoDbProvider.js  _findOneBy - ' + collectionName +': failed to obtain the db');
                    _rejectOrResolve(df, { message : "Failed to connect DB"});
                }
            );

            return df.promise;
        },

        _find = function(collectionName, match, options){
            var df = Q.defer();


            Q.when(connect()).then(
                //success callback
                function(db){
                    try{
                        var collection = db.collection(collectionName);
                        logger.log('mongoDbProvider.js _find - ' + collectionName +': querying');

                        collection.find(
                            match,
                            options
                        ).toArray(
                            function(err, docs){
                                logger.log('mongoDbProvider.js  _find - ' + collectionName +': resolved!');
                                _rejectOrResolve(df, err, docs);
                            }
                        );
                    }catch(e){
                        _rejectOrResolve(df, e);
                    }
                },
                //fail callback
                function(){
                    logger.log('mongoDbProvider.js  _find - ' + collectionName +': failed to obtain the db');
                    _rejectOrResolve(df, { message : "Failed to connect DB"});
                }
            );

            return df.promise;
        },

        _insertNew = function(collectionName, document){
            var df = Q.defer();

            Q.when(connect()).then(
                function(db){
                    try{
                        var collection = db.collection(collectionName);

                        collection.insert(
                            document,
                            //{forceServerObjectId : true},
                            function(err, result){
                                _rejectOrResolve(df, err, result && result[0]);
                            }
                        );
                    }catch(e){
                        _rejectOrResolve(df, e);
                    }

                },
                //fail callback
                function(){
                    logger.log('mongoDbProvider.js _upsertByMatch -' + collectionName + ': failed to obtain the db');
                    _rejectOrResolve(df, { message : "Failed to connect DB"});
                }
            );

            return df.promise;
        },

        _upsertByMatch = function(collectionName, sort, match, updateDo){
            var df = Q.defer();

            Q.when(connect()).then(
                function(db){
                    try{
                        var collection = db.collection(collectionName);

                        collection.findAndModify(
                            match,
                            sort,
                            updateDo,
                            {new:true, upsert:true},
                            function(err, result){
                                _rejectOrResolve(df, err, result);
                            }
                        );
                    }catch(e){
                        _rejectOrResolve(df, e);
                    }

                },
                //fail callback
                function(){
                    logger.log('mongoDbProvider.js _upsertByMatch -' + collectionName + ': failed to obtain the db');
                    _rejectOrResolve(df, { message : "Failed to connect DB"});
                }
            );

            return df.promise;
        },

        _rejectOrResolve = function(df, err, result){
            if(err){
                df.reject(err);
            }else{
                df.resolve(result);
            }
        };

    return {
        connect                             : connect,
        close                               : close,

        //Api Call log
        insertApiCallLog                    : insertApiCallLog,

        //Admin Account
        loadAdminAccounts                   : loadAdminAccounts,
        findAdminAccountById                : findAdminAccountById,
        findAdminAccountByEmail             : findAdminAccountByEmail,
        findAdminAccountByUsername          : findAdminAccountByUsername,
        findAdminAccountByTenantAndEmail    : findAdminAccountByTenantAndEmail,
        findAdminAccountByTenantAndUsername : findAdminAccountByTenantAndUsername,
        upsertAdminAccount                  : upsertAdminAccount,
        updateAdminAccount                  : updateAdminAccount,

        //Admin Authorizations
        findAdminAuthorizationsByAdminId    : findAdminAuthorizationsByAdminId,
        createAdminPermissions              : createAdminPermissions,
        updateAdminPermissionsById          : updateAdminPermissionsById,
        updateAdminPermissions              : updateAdminPermissions,

        //App Account
        findAppAccountByAppKey              : findAppAccountByAppKey,
        upsertAppAccountByAppkey            : upsertAppAccountByAppkey,

        //Admin Auth Token
        findAdminAuthTokenByToken           : findAdminAuthTokenByToken,
        upsertAdminAuthToken                : upsertAdminAuthToken,

        //Tenant
        findTenantById                      : findTenantById,
        loadTenants                         : loadTenants,
        upsertTenant                        : upsertTenant,
        updateTenant                        : updateTenant,

        //Affiliates
        createAffiliate                     : createAffiliate,
        updateAffiliate                     : updateAffiliate,
        findAffiliateById                   : findAffiliateById,
        loadAffiliates                      : loadAffiliates,

        //Actions
        createAction                        : createAction,
        updateAction                        : updateAction,
        updateActionByKey                   : updateActionByKey,
        findActionById                      : findActionById,
        findActionByKey                     : findActionByKey,
        loadActions                         : loadActions,

        //Posts
        createPost                          : createPost,
        updatePost                          : updatePost,
        findPostById                        : findPostById,
        loadPosts                           : loadPosts
    };
};

