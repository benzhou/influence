var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

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

var routes = {},
    dataObjects = {},
    appConfig = require('config'),
    mongoDbProvider = require('./dbProvider/mongodb/mongoDbProvider')(dataObjects)
    accountDataObject = require('./dataHandler/authDataHandler')(dataObjects),
    authDataHandler = require('./dataHandler/authDataHandler')(accountDataObject),
    authBusiness = require('./business/authBusiness')(authDataHandler);

//Setup routes
routes.site = require('./routes/index')(express.Router());
routes.api = require('./routes/api')(express.Router(authBusiness));

app.use('/', routes.site);
app.use('/api', routes.api);

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


module.exports = app;
