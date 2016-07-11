module.exports = {
  setup: function(app){
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
    
    return passport;
  }
}