
/**
 * Module dependencies.
 */

var express = require('express') ,
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
  links = require('./links'),
  users = require('./users'),
  post = require('./post'),
  fs = require('fs');

var app = module.exports = express.createServer();

// db
var Mongoose = require('mongoose');
var db = Mongoose.connect('mongodb://localhost/hp');
//var db = Mongoose.connect('mongodb://masmith-mbp.turner.com/hp');

require('./schema');
var User = db.model('User');
var Post = db.model('Post');

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
  app.use(stylus.middleware({ debug:true, force:true, src:__dirname+'/public',dest:__dirname+'/public', compile:compile}));
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

function requiresLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/sessions/new?redir=' + req.url);
    }
}

app.post('/sessions',
function(req, res) {
    User.authenticate(req.body.login, req.body.password,
    function(user) {
        if (user) {
            req.session.user = user;
            res.redirect(req.body.redir || '/post');
        } else {
            req.flash('warn', 'Login failed');
            res.render('sessions/new', {
                redir: req.body.redir
            });
        }
    });
});

app.post('/users',
function(req, res) {
    var user = new User(req.body.user);
    user.save(function() {
        res.redirect('/sessions/new');
    });
});

app.post('/post', function(req, res) {
    console.log(req.files.post);
    // get the temporary location of the file
//    var tmp_path = req.files.post.image.path;
    // set where the file should actually exists - in this case it is in the "images" directory
//    var target_path = __dirname + '/public/uploads/' + req.files.post.image.name;
    // move the file from the temporary location to the intended location
//    fs.rename(tmp_path, target_path, function(err) {
//        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
//        fs.unlink(tmp_path, function() {
//            if (err) throw err;
            var post = new Post(req.body.post);
//            post.image = '../uploads/' + req.files.post.image.name;
            console.log(post);
            post.save(function() {
            res.redirect('/post');
//          });
//        });
    });
});
app.get('/sessions/destroy',
function(req, res) {
    delete req.session.user;
    res.redirect('/sessions/new');
});

app.get('/post/new', requiresLogin,
function(req, res) {
    res.render('post/new', {
        post: req.body && req.body.post || new Post()
    });
});

app.get('/sessions/new',
function(req, res) {
    res.render('sessions/new', {
        redir: req.query.redir
    });
});

app.get('/',
function(req, res) {
    var currentDatePlusOne = new Date();
    currentDatePlusOne.setDate(currentDatePlusOne.getDate()-2);
    Post.where('eventDate').$gt(currentDatePlusOne).sort('eventDate', 'ascending').execFind(
      function(err, posts) {
        Post.count({}, function( err, count){
        });
        res.render('post/index', {
            posts: posts
        });
    });
});

app.get('/post',
function(req, res) {
    var currentDatePlusOne = new Date();
    currentDatePlusOne.setDate(currentDatePlusOne.getDate()-2);
    Post.where('eventDate').$gt(currentDatePlusOne).sort('eventDate', 'ascending').execFind(
      function(err, posts) {
        Post.count({}, function( err, count){
        });
        res.render('post/index', {
            posts: posts
        });
    });
});

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
app.get('/users/new', requiresLogin,
function(req, res) {
    res.render('users/new', {
        user: req.body && req.body.user || new User()
    });
});
app.get('/users', post.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);