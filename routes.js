app = module.parent.exports.app;

/* Controller routes that basically view a static page */
var eventcalendar = require('./controllers/eventcalendar');
var contacts = require('./controllers/contacts');
var tennis = require('./controllers/tennis');
var pool = require('./controllers/pool');
var clubhouse = require('./controllers/clubhouse');
var socialevents = require('./controllers/socialevents');
var acc = require('./controllers/acc');
var board = require('./controllers/board');
var newsletter = require('./controllers/newsletter');
var photoalbum = require('./controllers/photoalbum');
var map = require('./controllers/map');
var lots = require('./controllers/map/lots');
var faq = require('./controllers/faq');
var legalstuff = require('./controllers/legalstuff');
var reference = require('./controllers/reference');
var links = require('./controllers/links');
var users = require('./controllers/users');
var post = require('./controllers/post');

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

/* Database / Schema */
var Mongoose = require('mongoose');
var db = Mongoose.connect('mongodb://localhost/hp');
require('./model/schema');
var User = db.model('User');
var Post = db.model('Post');
var AccessLog = db.model('AccessLog');
var Advertiser = db.model('Advertiser');

/* Middleware authentication */
function requiresLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/sessions/new?redir=' + req.url);
    }
}

/* Creating admins for website */
app.post('/users',
function(req, res) {
    var user = new User(req.body.user);
    user.save(function() {
        res.redirect('/sessions/new');
    });
});

app.get('/users/new', requiresLogin,
function(req, res) {
    res.render('users/new', {
        user: req.body && req.body.user || new User()
    });
});

/* Sessions */
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

app.get('/sessions/new',
function(req, res) {
    res.render('sessions/new', {
        redir: req.query.redir
    });
});

app.get('/sessions/destroy',
function(req, res) {
    delete req.session.user;
    res.redirect('/sessions/new');
});

/* Events / Activities management*/
app.post('/post', requiresLogin, 
function(req, res) {
    var post = new Post(req.body.post);
    post.save(function(err) {
		if (err)
			throw err;
        else
			res.redirect('/post/admin');
    });
});

app.put('/post', requiresLogin, 
function(req, res) {
  Post.findById(req.body.id,
    function(err, post) {
      if (err) {
        throw err;
      }
      else
      {
        post.name = req.body.post.name;
        post.description = req.body.post.description;
        post.eventDate = req.body.post.eventDate;
        post.staticItem = req.body.post.staticItem;
        post.save(function(err) {
          if (err)
            throw err;
          else
            res.redirect('/post/admin');
        });
      }
  });
});

app.get('/post/delete/:id', requiresLogin,
function(req, res) {
    Post.remove({_id: req.params.id},
    function(err, posts) {
        if (err) {
            throw err;
        }
        res.redirect('/post/admin');
    });
});

app.get('/post/admin', requiresLogin,
function(req, res) {
    Post.find({}).sort('addedDate', 'descending').execFind(
      function(err, posts) {
        Post.count({}, function( err, count){
        });
        res.render('post/admin', {
            posts: posts
        });
    });
});

app.get('/post/new', requiresLogin,
function(req, res) {
    res.render('post/new', {
        post: req.body && req.body.post || new Post()
    });
});

app.get('/post/edit/:id', requiresLogin,
function(req, res) {
    Post.findById(req.params.id,
    function(err, post) {
        if (err) {
            throw err;
        }
        res.render('post/edit', {
          post: post, id: req.params.id
        });
    });
});

/*  Entry point which gets posts */
app.get('/',
function(req, res) {
    var ip_address = null;
    try {
      ip_address = req.headers['x-forwarded-for'];
    }
    catch ( error ) {
      ip_address = req.connection.remoteAddress;
    }
    var accessLog = new AccessLog();
    accessLog.ipAddress = ip_address;
    accessLog.save(function() {
    });
	var currentDatePlusOne = new Date();
    currentDatePlusOne.setDate(currentDatePlusOne.getDate()-2);
    var query = Post.find({});
    query.or([ {staticItem : true}, {eventDate : {$gt : currentDatePlusOne}} ]).sort('eventDate', 'ascending').exec(
      function(err, posts) {
        Post.count({}, function( err, count){
        });
        res.render('post/index', {
            posts: posts
        });
    });
});

app.get('/advertisers',
function(req, res) {
    Advertiser.find({}).sort('sortOrder', 'ascending').execFind(
    function(err, advertisers) {
        if(err){
            throw err;
        }
        res.contentType('application/json');
        res.json(advertisers);
    });
});