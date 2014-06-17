"use strict";

module.exports = function(config, MongoDb, Q, logger){

    var mongoClient = MongoDb.MongoClient,
        db,
        defer = null,
        promise = null,

        connect = function(){
            //If db is non-false value or promise is non-false value
            //it means has connected
            if(db && promise){
                return promise;
            }

            defer = Q.defer();
            promise = defer.promise;
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
                    defer.reject(new Error("Systems error..."));
                    return;
                }
                db = _db;
                logger.log('Database connection initialized');
                defer.resolve(db);
            });

            return promise;
        };

    return {
        connect : connect
    };
};

