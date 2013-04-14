var express = require('express') ,
  stylus = require('stylus'),
  fs = require('fs'),
  nib = require('nib'),
  RedisStore = require('connect-redis')(express);

var app = module.exports = express.createServer();

// Check node_env, if not set default to development
process.env.NODE_ENV = (process.env.NODE_ENV || "development");

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.bodyParser({uploadDir: __dirname + '/public/uploads'}));
  app.use(express.methodOverride());
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({
    secret:"highlandpointe2012",
    maxAge: new Date(Date.now() + 3600000),
    store: new RedisStore
  }));

  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.directory(__dirname + '/public'));
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(stylus.middleware({ debug:true, force:true, src:__dirname+'/public',dest:__dirname+'/public', compile:compile}));
  app.use('/', express.errorHandler({
    dump: true,
    stack: true
  }));
function compile(str, path) {
  return stylus(str).set('filename', path).set('compress', true).use(nib()).import('nib');
}
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.dynamicHelpers({
    session: function(req, res) {
        return req.session;
    },

    flash: function(req, res) {
        return req.flash();
    }
});

process.setMaxListeners(0);

app.listen(80, function() {
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

module.exports.app = app;
routes = require('./routes');
