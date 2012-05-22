var express = require('express') ,
  stylus = require('stylus'),
  fs = require('fs');
 
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
  app.use(express.cookieParser());
  app.use(express.session({
    secret: "north mountain road"
  }));
  app.use('/', express.errorHandler({
    dump: true,
    stack: true
  }));
  app.use(stylus.middleware({ debug:false, force:true, src:__dirname+'/public',dest:__dirname+'/public', compile:compile}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.directory(__dirname + '/public'));
});

function compile(str, path) {
	return stylus(str).set('filename', path).set('compress', true);
}

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
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

app.listen(8080, function() {
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

module.exports.app = app;
routes = require('./routes');