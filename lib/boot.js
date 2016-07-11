module.exports = {
  setup: function(){
    // Initialize Express
    var express = require('express');
    var app = express();

    var session = require('express-session');
    var pg = require('pg');
    var pgSession = require('connect-pg-simple')(session);

    app.use(session({ 
      store: new pgSession({
        pg: pg,
        conString: process.env.DATABASE_URL
      }),
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false
    }));

    // Static file serving
    app.use(express.static('public'));

    // TODO: Learn more about what this does, besides the obvious
    bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({
      extended: false
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.text());

    // Templates
    var nunjucks = require('nunjucks');
    nunjucks.configure('views', {
      autoescape: true,
      express: app
    });

    app.set('port', process.env.PORT || 3000);
    app.server = app.listen(app.get('port'), function() {
      return console.log('DD app is running on port', app.get('port'));
    });

    return app;
  }
}
