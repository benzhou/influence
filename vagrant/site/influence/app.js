var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoDb = require('mongodb');
var Q = require("q");
var util = require("util");
var crypto = require('crypto');


var exphbs  = require('express3-handlebars');

var app = express();
var hbs = exphbs.create({
                showTitle : true,
                // Specify helpers which are only registered on this instance.
                helpers: {
                    foo: function () { return 'FOO!'; },
                    bar: function () { return 'BAR!'; }
                }
            });

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

//Middleware Setup
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var routes              = {},

    //Dependencies initialization
    appConfig           = require('./config'),
    dataObjects         = {},
    errCodes            = require('./error/errorCodes'),

    influenceLogger     = require('./lib/logger')(),
    accountDataObject   = require('./dataHandler/authDataHandler')(dataObjects),

    helpers             = require('./lib/helpers'),

    mongoDbProvider     = require('./dbProvider/mongodb/mongoDbProvider')(appConfig.db, mongoDb, influenceLogger),
    influenceDbProvider = require('./dbProvider/influenceDbProvider')(mongoDbProvider),

    accountDataHandler  = require('./dataHandler/accountDataHandler')(influenceDbProvider),
    authDataHandler     = require('./dataHandler/authDataHandler')(influenceDbProvider),
    tenantsDataHandler  = require('./dataHandler/tenantsDataHandler')(influenceDbProvider),
    apiLogDataHandler   = require('./dataHandler/apiLogDataHandler')(influenceDbProvider),
    postDataHandler     = require('./dataHandler/postDataHandler')(influenceDbProvider),

    authorizationHelper = require("./business/authorizationHelper"),
    tenantsBusiness     = require('./business/tenantsBusiness')(helpers, influenceLogger, tenantsDataHandler),
    accountBusiness     = require('./business/accountBusiness')(helpers, util, influenceLogger, accountDataHandler),
    authBusiness        = require('./business/authBusiness')(helpers, util, influenceLogger, appConfig.app, accountBusiness, authDataHandler),
    apiLogBusiness      = require('./business/apiLogBusiness')(influenceLogger, apiLogDataHandler),
    postBusiness        = require('./business/postBusiness')(helpers, influenceLogger, postDataHandler),


    apiController       =  require('./controllers/apiController')(influenceLogger, authBusiness, accountBusiness, tenantsBusiness, authorizationHelper, postBusiness),

    adminAuthenticationMiddleware   = require('./middleware/adminAuthenticationMiddleware')(influenceLogger, authBusiness),
    apiLogMiddleware                = require('./middleware/apiLogMiddleware')(influenceLogger, apiLogBusiness),

    //Admins
    adminController       = require('./controllers/admin/adminController')(influenceLogger, appConfig.admin),
    //Client
    clientController      = require('./controllers/indexController')(influenceLogger, appConfig.client);

//Setup routes
routes.site = require('./routes/index')(express.Router(),influenceLogger, clientController);
routes.api = require('./routes/api')(express.Router(), influenceLogger, adminAuthenticationMiddleware, apiLogMiddleware, apiController);
routes.apiAdmin = require('./routes/apiAdmin')(express.Router(), influenceLogger, adminAuthenticationMiddleware, apiLogMiddleware, apiController);
routes.admin = require('./routes/admin')(express.Router(), influenceLogger, adminController);


app.use('/', routes.site);
app.use('/admin', routes.admin);

app.use('/api', routes.api);
app.use('/api/admin', routes.apiAdmin);

//catch any 404 routes for api only
app.use('/api', function(req, res, next){
    res.json(
        errCodes.C_404_001_001.httpStatus,
        {
            code : errCodes.C_404_001_001.code,
            message : errCodes.C_404_001_001.desc
        }
    );
})

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            stack: err.stack
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

process.on('uncaughtException', function(err) {
    console.log(err);
});

module.exports = app;
