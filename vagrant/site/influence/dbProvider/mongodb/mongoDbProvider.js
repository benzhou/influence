"use strict";

module.exports = function(config, MongoDb, Q, logger){

    var mongoClient = MongoDb.MongoClient,
        collections = {
            AdminAccount    : "AdminAccount",
            AppAccount      : "AppAccount"
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

        findAdminAccountById = function(adminId){
            return _findById(collections.AdminAccount, adminId);
        },

        upsertAdminAccountById = function(adminDo){
            var df = Q.defer();

            Q.when(connect()).then(
                //success callback
                function(db){
                    try{
                        var collection = db.collection(collections.AdminAccount);
                        logger.log('mongoDbProvider.js upsertAdminAccountById: got db collection');
                        logger.log(adminDo);
                        collection.update(
                            {_id    : adminDo._id},
                            adminDo,
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
                    logger.log('mongoDbProvider.js upsertAdminAccountById: failed to obtain the db');
                    _rejectOrResolve(df, { message : "Failed to connect DB"});
                }
            );

            return df.promise;
        },

        findAppAccountById = function(appId){
            return _findById(collections.AppAccount, appId);
        },

        findAppAccountByAppKey = function(appKey){
            return _findOneBy(collections.AppAccount, {appKey : appKey});
        },

        upsertAppAccountById = function(appDo){
            var df = Q.defer();

            Q.when(connect()).then(
                function(db){
                    try{
                        var collection = db.collection(collections.AppAccount);

                        collection.update(
                            {_id    : appDo._id},
                            appDo,
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
                    logger.log('mongoDbProvider.js upsertAppAccountById: failed to obtain the db');
                    _rejectOrResolve(df, { message : "Failed to connect DB"});
                }
            );

            return df.promise;
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

        _rejectOrResolve = function(df, err, result){
            if(err){
                df.reject(err);
            }else{
                df.resolve(result);
            }
        };

    return {
        connect                     : connect,
        close                       : close,

        findAdminAccountById        : findAdminAccountById,
        upsertAdminAccountById      : upsertAdminAccountById,

        findAppAccountById          : findAppAccountById,
        findAppAccountByAppKey      : findAppAccountByAppKey,
        upsertAppAccountById        : upsertAppAccountById
    };
};

