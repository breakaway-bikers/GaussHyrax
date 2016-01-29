var express = require('express');
var db = require('./db.js');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var env = require('node-env-file');
var CronJob = require('cron').CronJob;

//env(__dirname + '/.env');

var sendgrid = require('sendgrid')(process.env.SENDGRIDAPIKEY);
var GITHUB_CLIENT_ID = process.env.GITHUBCLIENTID;
var GITHUB_CLIENT_SECRET = process.env.GITHUBCLIENTSECRET;
console.log('\n\n\nHERE IS THE GITHUB CLIENT ID', process.env.GITHUBCLIENTID, '\n\n\n');

var port = process.env.PORT || 3000;

var app = express();

app.use(morgan('combined'));
app.use(express.static(__dirname + '/../client'));  //serve files in client
app.use(bodyParser.json());  // parse application/json
app.use(passport.initialize());

//function to configure the standard response handler

var configHandler = function(successCode, failCode, res) {
  return function(err, data) {
    if (err) {
      res.status(failCode).send(err);
    } else {
      res.status(successCode).send(data);
    }
  };
};

/////////////////////////////
/////////Passport////////////
/////////////////////////////
var noobyGlobalVariable;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('deserialize');
  User.findById(id, function(err, user) {
    console.log('deserializing err', err);
    done(err, user);
  });
});

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'https://prsnl-2.herokuapp.com/auth/github/callback',
},
  function(accessToken, refreshToken, profile, done) {
    db.User.findOne({ userName: profile.username }, function(err, user) {
      if (user) {
        console.log('this is the user', user);
        noobyGlobalVariable = user;
        return done(null, user);
      } else {
        var user = new db.User();
        user.userName = profile.username;
        user.save(function(err, user) {
          if (err) {
            console.log('error in saving');
            return done(null, false);
          } else {
            noobyGlobalVariable = user;
            console.log(user + ' was saved');
            return done(null, user);
          }
        });
      }
    });
  }
));

//////////////////////////////////////////
//CREATE
//////////////////////////////////////////

//save a user to DB
app.post('/api/user', function(req, res, next) {
  db.addUser(req.body, configHandler(201, 400, res));
})

//add new family member to user
.post('/api/family/:userId', function(req, res, next) {
  db.addFamilyMember(req.params, req.body, configHandler(201, 400, res));
  console.log('\n\n\nWE HAVE ADDED A USER\n\n\n');

})

//add new history to user's family member
.post('/api/history/:userId/:familyId', function(req, res, next) {
  db.addHistory(req.params, req.body, configHandler(201, 400, res));
})

//////////////////////////////////////////
//READ
//////////////////////////////////////////
.post('/api/grid', function(req, res, next) {
  console.log('\n\n\nREQUEST RECIEVED:', req.body, '\n\n\n');

  var email = req.body.theEmail;
  var message = req.body.theMessage;

  sendgrid.send({
    to:       email,
    from:     'diyelpin@gmail.com',
    subject:  'Message from prsnl-2.herokuapp.com',
    text:     message,
  }, function(err, json) {
    if (err) { return console.error(err); }

    console.log(json);
  });
})

//passport
.get('/auth/github',
  passport.authenticate('github'))

.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', scope: ['user:email'] }),
  function(req, res) {
    console.log('before redirecting');

    // Successful authentication, redirect home.
    console.log('data after authentication', noobyGlobalVariable);

    // res.send(noobyGlobalVariable);
    res.redirect('/#/dashboard');
  })
.get('/githubinfo', function(req, res) {
  console.log('githubinfo', noobyGlobalVariable);
  if (noobyGlobalVariable) {
    res.status(200).send(noobyGlobalVariable);
  } else {
    res.status(404).send();
  }
})

// find a user
.get('/api/user/:userName/:password', function(req, res, next) {
  db.verifyUser(req.params, configHandler(200, 404, res));
})

//get all family info for a user
.get('/api/family/:userId', function(req, res, next) {
  db.getAllFamily(req.params, configHandler(200, 400, res));
})

//get a single family member
.get('/api/family/:userId/:familyId', function(req, res, next) {
  db.getSingleFamilyMember(req.params, configHandler(200, 400, res));
})

//get all actions
.get('/api/actions', function(req, res, next) {
  db.getAllActions(configHandler(200, 400, res));
})

//////////////////////////////////////////
//UPDATE
//////////////////////////////////////////

//update family member
.put('/api/family/:userId/:familyId', function(req, res, next) {
  db.updateFamilyMember(req.params, req.body, configHandler(201, 400, res));
})

//update history member
.put('/api/history/:userId/:familyId/:historyId', function(req, res, next) {
  db.updateHistory(req.params, req.body, configHandler(201, 400, res));
})

//////////////////////////////////////////
//DELETE
//////////////////////////////////////////

//delete family member
.delete('/api/family/:userId/:familyId', function(req, res, next) {
  db.deleteFamilyMember(req.params, configHandler(201, 400, res));

})

//delete history
.delete('/api/history/:userId/:familyId/:historyId', function(req, res, next) {
  db.deleteHistory(req.params, configHandler(201, 400, res));
});

//////////////////////////////////////////
//CRON////////////////////////////////////
//////////////////////////////////////////
//run daily check

/* DAILY CHECK */

//cron job
//every day
//check user end date
//if end date === today, send email to that user

var checkEndDates = function() {
  db.emailToDoList(function(toDoList) {
    console.log('In the callback!', toDoList);
    if (toDoList.length > 0) {
      for (var i = 0; i < toDoList.length; i++) {
        var email = toDoList[i][0];
        var memberName = toDoList[i][2];
        var message = "It's time to contact" + memberName + ' !';

        sendgrid.send({
          to:       email,
          from:     'diyelpin@gmail.com',
          subject:  'Message from prsnl-2.herokuapp.com',
          text:     message,
        }, function(err, json) {
          if (err) { return console.error(err); }

          console.log(json);
        });
      }
    }
  });
};

var CronJob = require('cron').CronJob;
new CronJob('* */50 16-17 * * 1-7', function() {
  checkEndDates();
}, null, true, 'America/Los_Angeles');

app.listen(port);
console.log('server listening on port ' + port + '...');
