var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
//var users = require('./routes/chat');
var port = process.env.PORT || 3000;

var app = express();
//var server = require('http').createServer(app);

// view engine setup
app.engine('html', require('hjs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers
// ------------------------------------------------------------------------------
// development error handler will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', port);

var server = app.listen(app.get('port'), function() {
   //debug('Express server listening on port ' + server.address().port);
   console.log('Express server listening on port ' + server.address().port);
});

// setup socket.io
// ------------------------------------------------------------------------------
var io = require('socket.io').listen(server);
// Hiding log messages from socket.io. Comment to show everything.
//io.set('log level', 1);
require('./routes/chat')(app, io);