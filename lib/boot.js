module.exports = {
  setup: function(express){
    // Initialize Express
    var app = express();

    // Static file serving
    app.use(express.static('public'));

    bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({
      extended: true
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
