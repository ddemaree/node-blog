// server.js
// where your node app starts

// init
var H = require("hyperweb");
var pgstore = require("./pgstore");
var Item = require("./models/item");
app = H.blastOff();

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

app.get("/p/:postShortId", function(req, res){
  pgstore.findItemByShortID(req.params.postShortId).then(
    function(itemRow){
      res.redirect("/posts/" + itemRow.id);
    },
    function(err){
      handleNotFound(err, res);
    }
  );
});

app.get("/posts/:postId", function(req, res){
  console.log("Trying to find item with id %s", req.params.postId);
  pgstore.findItem(req.params.postId).then(
    function(itemRow){
      console.log(itemRow);
      response.render("single-post.html", {
        item: itemRow,
        title: itemRow.title
      });
    },
    function(err){
      handleNotFound(err, res);
    }
  );
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