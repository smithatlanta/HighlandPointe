app = module.parent.exports.app;

/* Controller routes that basically view a static page */
var eventcalendar = require('./controllers/eventcalendar');
var kiddiekapers = require('./controllers/kiddiekapers');
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
var search = require('./controllers/search');
var links = require('./controllers/links');
var users = require('./controllers/users');
var post = require('./controllers/post');
var classifieds = require('./controllers/classifieds');

app.get('/eventcalendar', eventcalendar.index);
app.get('/kiddiekapers', kiddiekapers.index);
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
app.get('/search', search.index);
app.get('/links', links.index);

/* Database / Schema */
var Mongoose = require('mongoose');
var dbstring = 'mongodb://smith2012:smith2012@ds033897.mongolab.com:33897/hp';
var db = Mongoose.connect(dbstring);
require('./model/schema');
var User = db.model('User');
var Post = db.model('Post');
var AccessLog = db.model('AccessLog');
var Advertiser = db.model('Advertiser');
var Classified = db.model('Classified');

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
        redir: req.query.redir,
        title: "Highland Pointe Online"
    });
});

app.get('/sessions/destroy',
function(req, res) {
    delete req.session.user;
    res.redirect('/sessions/new');
});

app.post('/search',
function(req, res) {
    var solr = require('solr-client');
    console.log(req.body.search);
    var client = solr.createClient("highlandpointe.org", "8983", "collection1", "/solr");
    var query = client.createQuery()
    .q(req.body.search)
    .dismax()
    .qf({title : 0.2 , content : 0.5})
    .start(0)
    .rows(500)
    .sort({url: 'desc', score: 'desc'})
    .restrict(['url', 'title', 'content']);
    client.search(query,function(err, obj){
        if(err){
            console.log(err);
        }else{
            var count = obj.response.numFound;
            if(count > 0){
                var z= [];
                for(var x=0; x<count; x++)
                {
                    var d = {};
                    d.url = obj.response.docs[x].url;
                    d.title = obj.response.docs[x].title;
                    d.content = obj.response.docs[x].content.slice(0, 300) + "...";
                    z.push(d);
                }
                res.render('search/index', { results : z, title: "Highland Pointe Online - Search" });
            }
            else
            {
                console.log("no docs found");
            }
        }
    });
});

/* Events / Activities management */

/* insert */
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

/* update */
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

/* delete */
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

/* page routes */
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

/* Classifieds management */

/* insert */
app.post('/classifieds', requiresLogin,
function(req, res) {
    var classified = new Classified(req.body.classified);
    classified.save(function(err) {
        if (err)
            throw err;
        else
            res.redirect('/classifieds/admin');
    });
});

/* update */
app.put('/classifieds', requiresLogin,
function(req, res) {
  Classified.findById(req.body.id,
    function(err, classified) {
      if (err) {
        throw err;
      }
      else
      {
        classified.name = req.body.classified.name;
        classified.description = req.body.classified.description;
        classified.save(function(err) {
          if (err)
            throw err;
          else
            res.redirect('/classifieds/admin');
        });
      }
  });
});

/* delete */
app.get('/classifieds/delete/:id', requiresLogin,
function(req, res) {
    Classified.remove({_id: req.params.id},
    function(err, classified) {
        if (err) {
            throw err;
        }
        res.redirect('/classifieds/admin');
    });
});

/* page routes */
app.get('/classifieds',
function(req, res) {
    var query = Classified.find(
      function(err, classifieds) {
        Classified.count({}, function( err, count){
        });
        res.render('classifieds/index', {
            classifieds: classifieds,
            title: "Highland Pointe Online - Classifieds"
        });
    });
});


app.get('/classifieds/admin', requiresLogin,
function(req, res) {
    Classified.find({}).execFind(
      function(err, classifieds) {
        Classified.count({}, function( err, count){
        });
        res.render('classifieds/admin', {
            classifieds: classifieds
        });
    });
});

app.get('/classifieds/new', requiresLogin,
function(req, res) {
    res.render('classifieds/new', {
        classified: req.body && req.body.classified || new Classified()
    });
});

app.get('/classifieds/edit/:id', requiresLogin,
function(req, res) {
    Classified.findById(req.params.id,
    function(err, classified) {
        if (err) {
            throw err;
        }
        res.render('classifieds/edit', {
            classified: classified, id: req.params.id
        });
    });
});


/* Sponsored Link Management*/

/* insert */
app.post('/adv', requiresLogin,
function(req, res) {
    var advertiser = new Advertiser(req.body.advertiser);
    advertiser.save(function(err) {
        if (err)
            throw err;
        else
            res.redirect('/adv/admin');
    });
});

/* update */
app.put('/adv', requiresLogin,
function(req, res) {
  Advertiser.findById(req.body.id,
    function(err, advertiser) {
      if (err) {
        throw err;
      }
      else
      {
        advertiser.referrer = req.body.advertiser.referrer;
        advertiser.textToDisplay = req.body.advertiser.textToDisplay;
        advertiser.sortOrder = req.body.advertiser.sortOrder;
        advertiser.save(function(err) {
          if (err)
            throw err;
          else
            res.redirect('/adv/admin');
        });
      }
  });
});

/* delete */
app.get('/adv/delete/:id', requiresLogin,
function(req, res) {
    Advertiser.remove({_id: req.params.id},
    function(err, advertiser) {
        if (err) {
            throw err;
        }
        res.redirect('/adv/admin');
    });
});

/* page routes */
app.get('/adv/admin', requiresLogin,
function(req, res) {
    Advertiser.find({}).sort('sortOrder', 'ascending').execFind(
      function(err, advs) {
        Advertiser.count({}, function( err, count){
        });
        res.render('adv/admin', {
            advs: advs
        });
    });
});

app.get('/adv/new', requiresLogin,
function(req, res) {
    res.render('adv/new', {
        advertiser: req.body && req.body.advertiser || new Advertiser()
    });
});

app.get('/adv/edit/:id', requiresLogin,
function(req, res) {
    Advertiser.findById(req.params.id,
    function(err, advertiser) {
        if (err) {
            throw err;
        }
        res.render('adv/edit', {
            advertiser: advertiser, id: req.params.id
        });
    });
});

/*  Main entry point */
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
    query.or([ {staticItem : true}, {eventDate : {$gt : currentDatePlusOne}} ]).sort('eventDate', 'ascending').sort('addedDate','descending').exec(
      function(err, posts) {
        Post.count({}, function( err, count){
        });
        res.render('post/index', {
            posts: posts,
            title: "Highland Pointe Online"
        });
    });
});

/* ajax calls */
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

app.get('/upload',
function(req, res) {
    res.render('upload/submit', {title: "Highland Pointe Online"});
});

app.post('/upload',
function(req, res) {
	var files;
    var fileNames = new Array();
    if(req.files.upload.name !== undefined) {
        files += req.files.upload.name + '\n';
        fileNames.push(req.files.upload.name);
    }
    else {
        for(i=0; i<req.files.upload.length; i++) {
            if(req.files.upload[i].name !== undefined) {
                files += req.files.upload[i].name + '\n';
                fileNames.push(req.files.upload[i].name);
            }
        }
    }
    
    var Email = require('email').Email;
	var bodyMsg = "Submitter: " + req.body.username + "\nEmail Address: " + req.body.emailaddr + "\nEvent: " + req.body.eventname + "\nFiles: " + files;
    console.log(bodyMsg);
	var myMsg = new Email(
        { from: "smithatlanta@gmail.com", to: "smithatlanta@gmail.com", subject: "Files Uploaded" , body: bodyMsg }
    );
    myMsg.send(function(err){
        if(err){
            console.log(err);
        }
    });
    res.render('upload/uploadcomplete', { files: fileNames });
});

app.get('/upload/uploadcomplete',
function(req, res) {
    res.render('upload/uploadcomplete');
});
