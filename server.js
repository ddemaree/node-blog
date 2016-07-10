// server.js
// where your node app starts

try {
  require("dotenv").config();
} catch(error) {
  console.error("Error was %s", error);
}

// init
var express = require('express');
var app = express();
app.use(express.static('public'));

// TODO: Learn more about what this does, besides the obvious
bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(bodyParser.text());

var nunjucks = require('nunjucks');
nunjucks.configure('views', {
  autoescape: true,
  express: app
});

app.set('port', process.env.PORT || 3000);
app.server = app.listen(app.get('port'), function() {
  return console.log('DD app is running on port', app.get('port'));
});


var pgstore = require("./pgstore");
var Item = require("./models/item");

// Handle errors
app.use(function(err, req, res, next){
  handleError(err, res);
});

// *.* ROUTES *.* //

app.get("/", function (request, response) {
  pgstore.getAllItems().then(function(allItems){
    response.render('index.html', {
      title: "Welcome To HyperDev",
      items: allItems
    });
  });
});

app.post("/posts", function (request, response) {
  // TODO: This function does stuff that's not strictly necessary in the pg world
  var newPost = Item.initializeNewItem(request.body);
  console.log(newPost);

  pgstore.createItem(newPost).then(
    function(result){
      response.redirect("/");
    },
    function(err){
      handleError(err, response);
    }
  );
});

app.get("/posts/:postId", function(req, res){
  pgstore.findItem(req.params.postId).then(
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
    pgstore.findItemByShortID(req.params.postShortId).then(
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
