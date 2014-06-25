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

    accountDataObject   = require('./dataHandler/authDataHandler')(dataObjects),

    helpers             = require('./lib/helpers'),

    mongoDbProvider     = require('./dbProvider/mongodb/mongoDbProvider')(appConfig.db, mongoDb, Q, console),
    influenceDbProvider = require('./dbProvider/influenceDbProvider')(Q, mongoDbProvider),

    accountDataHandler  = require('./dataHandler/accountDataHandler')(influenceDbProvider),
    authDataHandler     = require('./dataHandler/authDataHandler')(influenceDbProvider),
    tenantsDataHandler  = require('./dataHandler/tenantsDataHandler')(influenceDbProvider),
    apiLogDataHandler   = require('./dataHandler/apiLogDataHandler')(influenceDbProvider),

    tenantsBusiness     = require('./business/tenantsBusiness')(helpers, logger, tenantsDataHandler),
    accountBusiness     = require('./business/accountBusiness')(Q, helpers, util, console, errCodes, accountDataHandler),
    authBusiness        = require('./business/authBusiness')(Q, helpers, util, console, appConfig.app, errCodes, accountDataHandler, authDataHandler),
    apiLogBusiness      = require('./business/apiLogBusiness')(logger, apiLogDataHandler),

    apiController       =  require('./controllers/apiController')(Q, console, authBusiness, accountBusiness),

    adminAuthenticationMiddleware   = require('./middleware/adminAuthenticationMiddleware')(console, authBusiness),
    apiLogMiddleware                = require('./middleware/apiLogMiddleware')(console, apiLogBusiness);

//Setup routes
routes.site = require('./routes/index')(express.Router());
routes.api = require('./routes/api')(express.Router(), console, adminAuthenticationMiddleware, apiLogMiddleware, apiController);
routes.admin = require('./routes/admin')(express.Router());


app.use('/', routes.site);
app.use('/admin', routes.admin);

app.use('/api', routes.api);

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
            error: err
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
