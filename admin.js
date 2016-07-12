module.exports = function(express, passport){
  var admin = express.Router();
  var Item = require('./models/item');
  var db = require('./db');

  function requireLogin(req, res, next){
    if(req.user) {
      next();
    } else {
      res.format({
        'html': function(){
          res.redirect("/admin/login");
        },
        'default': function(){
          res.status(401).send("Not allowed!");
        }
      })
    }
  }

  
  admin.get("/login", function(req, res){
    res.render('admin/login.html');
  });
  
  admin.post('/login',
    passport.authenticate('local', { successRedirect: '',
                                    failureRedirect: 'login',
                                    failureFlash: true })
  );
  
  admin.get("/logout", function(req, res){
    req.logout();
    res.redirect("./");
  });

  admin.get("/", requireLogin, function(req, res){
    db.getAllItems().then(function(allItems){
      res.render('admin/list-posts.html', {
        items: allItems
      });
    });
  });
  
  admin.get("/posts/new", requireLogin, function(req, res){
    res.render("admin/new-post.html");
  });
  
  admin.post("/posts", requireLogin, function (request, response) {
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
  
  return admin;
}