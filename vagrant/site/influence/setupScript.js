var mongoDb = require('mongodb');
var Q = require("q");
var util = require("util");
var crypto = require('crypto');
var logger = console;

var appConfig           = require('./config'),
    dataObjects         = {},
    errCodes            = require('./error/errorCodes'),

    helpers             = require('./lib/helpers'),

    mongoDbProvider     = require('./dbProvider/mongodb/mongoDbProvider')(appConfig.db, mongoDb, Q, console),
    influenceDbProvider = require('./dbProvider/influenceDbProvider')(Q, mongoDbProvider),

    accountDataHandler  = require('./dataHandler/accountDataHandler')(influenceDbProvider),
    authDataHandler     = require('./dataHandler/authDataHandler')(influenceDbProvider),
    tenantsDataHandler  = require('./dataHandler/tenantsDataHandler')(influenceDbProvider),

    tenantsBusiness     = require('./business/tenantsBusiness')(helpers, logger, tenantsDataHandler);
    accountBusiness     = require('./business/accountBusiness')(Q, helpers, util, console, errCodes, accountDataHandler),
    authBusiness        = require('./business/authBusiness')(Q, helpers, util, console, appConfig.app, errCodes, accountDataHandler, authDataHandler),

    tenantDo        = {
        name        : "First Ever"
    },
    adminDo         = {
        tenantId    : 1,
        username    : "ben",
        email       : "ben@test.com",
        password    : "test",
        firstname   : "Ben",
        lastname    : "Zhou",
        displayname : "aben",
        createdBy   : 1
    };


logger.log("=======================================");
logger.log("Getting start to initialize our DB");
logger.log("=======================================");

logger.log("Creating tenant record...");
Q.when(tenantsBusiness.createTenant(tenantDo.name)).then(
    function(tenant){
        if(!tenant){
            throw new Error("Not able to create tenant.");
        }

        logger.log("Creating tenant record... Done!");

        adminDo.tenantId = tenant._id;

        logger.log("Creating admin record...");

        var promise = accountBusiness
                        .createAdminAccount(
                            adminDo.tenantId,
                            adminDo.username,
                            adminDo.email,
                            adminDo.password,
                            adminDo.firstname,
                            adminDo.lastname,
                            adminDo.displayname,
                            adminDo.createdBy
                        );

        promise.then(
            function(admin){
                if(!admin){
                    throw new Error("Not able to create admin.");
                }

                logger.log("Creating admin record... Done!");
            }
        );

        return promise;
    }
).catch(
    function(err){
        logger.log("=======================================");
        logger.log("ERROR JUST OCCURRED!");
        logger.log("=======================================");

        logger.log(err);
    }
).done(
    function(){
        logger.log("=======================================");
        logger.log("Initializating process completed, Exiting...");
        logger.log("=======================================");

    }
);

