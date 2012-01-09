
/**
 * Module dependencies.
 */

var express = require('express') ,
  routes = require('./routes'),
  stylus = require('stylus'),
  eventcalendar = require('./eventcalendar'),
  contacts = require('./contacts'),
  tennis = require('./tennis'),
  pool = require('./pool'),
  clubhouse = require('./clubhouse'),
  socialevents = require('./socialevents'),
  acc = require('./acc'),
  board = require('./board'),
  newsletter = require('./newsletter'),
  photoalbum = require('./photoalbum'),
  map = require('./map'),
  lots = require('./map/lots'),
  faq = require('./faq'),
  legalstuff = require('./legalstuff'),
  reference = require('./reference'),
  links = require('./links');
  users = require('./users');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(stylus.middleware({ debug:true, force:true, src:__dirname+'/public',dest:__dirname+'/public', compile:compile}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
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

// Routes

app.get('/', routes.index);
app.get('/eventcalendar', eventcalendar.index);
app.get('/contacts', contacts.index);
app.get('/tennis', tennis.index);
app.get('/pool', pool.index);
app.get('/clubhouse', clubhouse.index);
app.get('/socialevents', socialevents.index);
app.get('/acc', acc.index);
app.get('/board', board.index);
app.get('/newsletter', newsletter.index);
app.get('/photoalbum', photoalbum.index);
app.get('/map', map.index);
app.get('/map/lots', lots.index);
app.get('/faq', faq.index);
app.get('/legalstuff', legalstuff.index);
app.get('/reference', reference.index);
app.get('/links', links.index);
app.get('/users', users.index);

app.post('/users', function(req, res) {
  res.redirect('/users');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);