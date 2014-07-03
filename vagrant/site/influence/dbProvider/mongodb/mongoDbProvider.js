"use strict";

var Q = require("q");

module.exports = function(config, MongoDb, logger){

    var mongoClient = MongoDb.MongoClient,
        collections = {
            AdminAccount        : "AdminAccount",
            AppAccount          : "AppAccount",
            AdminAuthToken      : "AdminAuthToken",
            Tenants             : "Tenants",
            APICallLog          : "APICallLog"
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
            return _upsertByMatch(collections.AdminAccount, {createdOn:1}, {tenantId:adminDo.tenantId,email:adminDo.email}, adminDo);
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

        //Tenants CURD
        findTenantById = function(tenantId){
            return  _findOneBy(collections.Tenants, {_id : tenantId});
        },
        upsertTenant = function(tenant){
            return _insertNew(collections.Tenants, tenant);
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

        insertApiCallLog                    : insertApiCallLog,

        findAdminAccountById                : findAdminAccountById,
        findAdminAccountByEmail             : findAdminAccountByEmail,
        findAdminAccountByTenantAndEmail    : findAdminAccountByTenantAndEmail,
        findAdminAccountByTenantAndUsername : findAdminAccountByTenantAndUsername,
        upsertAdminAccount                  : upsertAdminAccount,

        findAppAccountByAppKey              : findAppAccountByAppKey,
        upsertAppAccountByAppkey            : upsertAppAccountByAppkey,

        findAdminAuthTokenByToken           : findAdminAuthTokenByToken,
        upsertAdminAuthToken                : upsertAdminAuthToken,

        findTenantById                      : findTenantById,
        upsertTenant                        : upsertTenant
    };
};

