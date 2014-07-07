"use strict";

var Q = require("q");

module.exports = function(config, MongoDb, logger){

    var mongoClient = MongoDb.MongoClient,
        collections = {
            AdminAccount        : "AdminAccount",
            AppAccount          : "AppAccount",
            AdminAuthToken      : "AdminAuthToken",
            Tenants             : "Tenants",
            APICallLog          : "APICallLog",
            Actions             : "Actions",
            Affiliates          : "Affiliates"
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
        loadAdminAccounts = function(tenantId, numberOfPage, pageNumber){
            numberOfPage = numberOfPage || 10;
            pageNumber = pageNumber || 1;

            var
                skip = pageNumber - 1,
                limits = numberOfPage,
                opts = {
                    skip : skip,
                    limits : limits
                };

            return  _find(collections.AdminAccount, {tenantId : new MongoDb.ObjectID(tenantId)}, opts);
        },
        findAdminAccountById = function(adminId){
            return  _findOneBy(collections.AdminAccount, {_id : adminId});
        },
        findAdminAccountByEmail = function(email){
            return  _findOneBy(collections.AdminAccount, {email : email});
        },
        findAdminAccountByTenantAndEmail = function(tenantId, email){
            return  _findOneBy(collections.AdminAccount, {tenantId: new MongoDb.ObjectID(tenantId), email : email});
        },
        findAdminAccountByTenantAndUsername = function(tenantId, username){
            return  _findOneBy(collections.AdminAccount, {tenantId: new MongoDb.ObjectID(tenantId), username : username});
        },
        upsertAdminAccount = function(adminDo){
            adminDo.tenantId = new MongoDb.ObjectID(adminDo.tenantId);
            return _insertNew(collections.AdminAccount, adminDo);
        },
        updateAdminAccount = function(adminId, updateDo){
            return _upsertByMatch(collections.AdminAccount, {}, {_id : new MongoDb.ObjectID(adminId)}, {$set: updateDo});
        },

        //App Account CURD
        findAppAccountByAppKey = function(appKey){
            return _findOneBy(collections.AppAccount, {appKey : appKey});
        },
        upsertAppAccountByAppkey = function(appDo){
            return _upsertByMatch(collections.AppAccount,{createdOn:1}, {appKey:appDo.appKey}, appDo);
        },

        //Admin Auth Token CURD
        findAdminAuthTokenByToken = function(tokenStr){
            return _findOneBy(collections.AdminAuthToken, {token : tokenStr});
        },
        upsertAdminAuthToken = function(token, updateObj){
            return _upsertByMatch(collections.AdminAuthToken, {createdOn:1}, {token:token.token}, updateObj || token);
        },

        //Tenants
        findTenantById = function(tenantId){
            return  _findOneBy(collections.Tenants, {_id : tenantId});
        },
        upsertTenant = function(tenant){
            return _insertNew(collections.Tenants, tenant);
        },
        updateTenant = function(tenantId, updateDo){
            return _upsertByMatch(collections.Tenants, {}, {_id : new MongoDb.ObjectID(tenantId)}, {$set: updateDo});
        },
        loadTenants = function(numberOfPage, pageNumber, filter){
            numberOfPage = numberOfPage || 10;
            pageNumber = pageNumber || 1;

            var
                skip = pageNumber - 1,
                limits = numberOfPage,
                opts = {
                    skip : skip,
                    limits : limits
                };

            filter = filter || {};
            return  _find(collections.Tenants, filter, opts);
        },

        //Affiliates
        createAffiliate = function(affiliateDo){
            return _insertNew(collections.Affiliates, affiliateDo);
        },
        updateAffiliate = function(affiliateId, updateDo){
            return _upsertByMatch(collections.Affiliates, {}, {_id : new MongoDb.ObjectID(affiliateId)}, {$set: updateDo});
        },
        findAffiliateById = function(affiliateId){
            return  _findOneBy(collections.Affiliates, {_id : affiliateId});
        },
        loadAffiliates = function(filter, numberOfPage, pageNumber, sort){
            numberOfPage = numberOfPage || 10;
            pageNumber = pageNumber || 1;

            var
                skip = pageNumber - 1,
                limits = numberOfPage,
                opts = {
                    skip : skip,
                    limits : limits
                };

            filter = filter || {};
            if(sort){
                opt.sort = sort;
            }
            return  _find(collections.Affiliates, filter, opts);
        },

        //Actions
        createAction = function(actionDo){
            return _insertNew(collections.Actions, actionDo);
        },
        updateAction = function(actionId, updateDo){
            return _upsertByMatch(collections.Actions, {}, {_id : new MongoDb.ObjectID(actionId)}, {$set: updateDo});
        },
        findActionById = function(actionId){
            return  _findOneBy(collections.Actions, {_id : actionId});
        },
        loadActions = function(filter, numberOfPage, pageNumber){
            numberOfPage = numberOfPage || 10;
            pageNumber = pageNumber || 1;

            var
                skip = pageNumber - 1,
                limits = numberOfPage,
                opts = {
                    skip : skip,
                    limits : limits
                };

            filter = filter || {};
            return  _find(collections.Actions, filter, opts);
        },

        //Private Helper methods
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

                        if(match.hasOwnProperty("_id")){
                            match._id = new MongoDb.ObjectID(match._id);
                        }

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

                        if(match.hasOwnProperty("_id")){
                            match._id = new MongoDb.ObjectID(match._id);
                        }

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
        findAdminAccountByTenantAndEmail    : findAdminAccountByTenantAndEmail,
        findAdminAccountByTenantAndUsername : findAdminAccountByTenantAndUsername,
        upsertAdminAccount                  : upsertAdminAccount,
        updateAdminAccount                 : updateAdminAccount,

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
        findActionById                      : findActionById,
        loadActions                         : loadActions
    };
};

