var express = require('express');
// var cookieparser = require('cookieparser');
var session = require('express-session');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Tokens = require('./app/collections/tokens');
var Token = require('./app/models/token');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
// app.use(cookieparser());
app.use(session({
  secret: 'ryanandzacharenotawesome',
  resave: false,
  saveUninitialized: true
}));


//restrict function to redirect user to login page if page is restricted
function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

app.get('/', restrict, function(req, res) {
  res.render('index');
});

app.get('/create', restrict, function(req, res) {
  res.render('index');
});

//login get route set by using (i think?) the login partial injected into index.ejs in the uniquely-named login id

app.get('/login',function(req,res){
  res.render('login');
});

app.post('/login',function(req, res) {
  var username=req.body.username;
  var password=req.body.password;
  //check for validity
  //modified to incorporate .catch if found does not exist to adhere to best practices of bookshelf
  new User({username: username}).fetch({require: true})
    .then(function(found){
        bcrypt.compare(password, found.attributes.password, function(err, result) {
          if (result) {
            req.session.regenerate(function(){
              req.session.user = username;
              res.redirect('/');
            });
          } else {
            //throw error message to user to try again
            console.log('wrooooong password or log in!');
            res.render('login');
          }
        });
      })
    .catch(function() {
      res.render('login');
    });
});

app.get('/logout', function(request, response){
  request.session.destroy(function(){
    response.redirect('/login');
  });
});

app.get('/signup',function(req,res){
  res.render('signup');
});

//modified to incorporate .catch if found does not exist to adhere to best practices of bookshelf
app.post('/signup',function(req,res){
  var username=req.body.username;
  var password=req.body.password;
  //check for validity
  //create a new user, check is user was found
  new User({
      username: username
    }).fetch().then(function(found) {
        res.send(200, 'please choose a different username!');
      })
      .catch(function() {
        var user = new User({
          username: username,
          password: password
        });
        user.save().then(function(newUser) {
          Users.add(newUser);
          res.render('login');
        });
      });
});

app.get('/links', restrict, function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', restrict, function(req, res) {
  var uri = req.body.url;
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });


      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
