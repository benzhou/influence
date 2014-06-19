"use strict";

module.exports = function(config, MongoDb, Q, logger){

    var mongoClient = MongoDb.MongoClient,
        collections = {
            AdminAccount    : "AdminAccount",
            AppAccount      : "AppAccount",
            AdminToken      : "AdminToken"
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

        //Admin Account CURD
        findAdminAccountById = function(adminId){
            return  _findOneBy(collections.AdminAccount, {_id : adminId});
        },
        findAdminAccountByEmail = function(email){
            return  _findOneBy(collections.AdminAccount, {email : email});
        },
        findAdminAccountByTenantAndEmail = function(tenantId, email){
            return  _findOneBy(collections.AdminAccount, {tenantId: tenantId, email : email});
        },
        findAdminAccountByTenantAndUsername = function(tenantId, username){
            return  _findOneBy(collections.AdminAccount, {tenantId: tenantId, username : username});
        },
        upsertAdminAccount = function(adminDo){
            return _upsertByMatch(collections.AdminAccount, {tenantId:adminDo.tenantId,email:adminDo.email}, adminDo);
        },

        //App Account CURD
        findAppAccountById = function(appId){
            return _findById(collections.AppAccount, appId);
        },
        findAppAccountByAppKey = function(appKey){
            return _findOneBy(collections.AppAccount, {appKey : appKey});
        },
        upsertAppAccountById = function(appDo){
            return _upsertByMatch(collections.AppAccount, {_id:appDo._id}, appDo);
        },

        //Admin Token CURD
        findAdminToken = function(adminToken){
            return _findOneBy(collections.AdminToken, {token : adminToken});
        },
        upsertAdminTokenByToken = function(adminTokenDo){
            return _upsertByMatch(collections.AdminToken, {token:adminTokenDo.tokenn}, adminTokenDo);
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
                        logger.log('mongoDbProvider.js _findOneBy - ' + collectionName +': got db object');
                        var collection = db.collection(collectionName);

                        logger.log('mongoDbProvider.js _findOneBy - ' + collectionName +': got db collection');

                        collection.findOne(
                            match,
                            function(err, result){
                                logger.log('mongoDbProvider.js  _findOneBy - ' + collectionName +': found!');
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

        _upsertByMatch = function(collectionName, match, updateDo){
            var df = Q.defer();

            Q.when(connect()).then(
                function(db){
                    try{
                        var collection = db.collection(collectionName);

                        collection.update(
                            match,
                            updateDo,
                            {
                                upsert  : true
                            },
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

        findAdminAccountById                : findAdminAccountById,
        findAdminAccountByEmail             : findAdminAccountByEmail,
        findAdminAccountByTenantAndEmail    : findAdminAccountByTenantAndEmail,
        findAdminAccountByTenantAndUsername : findAdminAccountByTenantAndUsername,
        upsertAdminAccount                  : upsertAdminAccount,

        findAppAccountById                  : findAppAccountById,
        findAppAccountByAppKey              : findAppAccountByAppKey,
        upsertAppAccountById                : upsertAppAccountById,

        findAdminToken                      : findAdminToken,
        upsertAdminTokenByToken             : upsertAdminTokenByToken
    };
};

