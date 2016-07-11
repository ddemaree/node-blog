// Require .env locally, if present (HyperDev will do this automatically)
require("dotenv").config();

var redis = require("redis");
var redisClient = redis.createClient({url: process.env.REDIS_URL});
console.log(redisClient.get('helloWorld'));

var db = require("./db");
var Item = require("./models/item");
var app = require("./lib/boot").setup();
var passport = require('./lib/authentication').setup(app);

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
