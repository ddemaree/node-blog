// Require .env locally, if present (HyperDev will do this automatically)
require("dotenv").config();

var redis = require("redis");
var redisClient = redis.createClient({url: process.env.REDIS_URL});
console.log(redisClient.get('helloWorld'));

var db = require("./db");
var Item = require("./models/item");
var app = require("./lib/boot").setup();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passwd'
  },
  function(username, password, done) {
    if(password == process.env.ADMIN_PASSWORD){
      done(null, {email: username});
    } else {
      done(null, false);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(id, done) {
  done(null, {email: id});
});

app.use(passport.initialize());
app.use(passport.session());

// Handle errors
app.use(function(err, req, res, next){
  handleError(err, res);
});

app.use(function(req, res, next){
  console.log("User: %s", req.user);
  next();
});

// *.* ROUTES *.* //

app.get("/", function (request, response) {
  db.getAllItems().then(function(allItems){
    response.render('index.html', {
      title: "Welcome To HyperDev",
      items: allItems,
      loggedInUser: request.user
    });
  });
});


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/login', function(req, res){
  res.render('login.html');
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

app.post("/posts", function (request, response) {
  // TODO: This function does stuff that's not strictly necessary in the pg world
  var newPost = Item.initializeNewItem(request.body);
  console.log(newPost);

  db.createItem(newPost).then(
    function(result){
      response.redirect("/");
    },
    function(err){
      handleError(err, response);
    }
  );
});

app.get("/posts/:postId", function(req, res){
  db.findItem(req.params.postId).then(
    function(itemRow){
      res.render("single-post.html", {
        item: itemRow,
        title: itemRow.title
      });
    },
    function(err){
      handleNotFound(err, res);
    }
  );
});

app.get("/p/:postShortId", function(req, res){
  try {
    db.findItemByShortID(req.params.postShortId).then(
      function(itemRow){
        res.redirect("/posts/" + itemRow.id);
      },
      function(err){
        handleNotFound(err, res);
      }
    );
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

function handleNotFound(err, res) {
  res.format({
    'default': function(){
      res.status(404).sendFile('404.html', {root: __dirname+'/public'});
    }
  })
}

function handleError(err, response) {
  console.log('==> ERROR ' + err);
  response.status(500).send(
    "<html><head><title>Internal Server Error!</title></head><body><pre>"
    + JSON.stringify(err, null, 2) + "</pre></body></pre>"
  );
}
