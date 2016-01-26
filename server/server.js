var express = require('express');
var db = require('./db.js');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
dotenv.load();
var sendgrid  = require('sendgrid')(process.env.sendgrid_apikey);

var port = process.env.PORT || 3000;

var app = express();

app.use(morgan('combined'))
app.use(express.static(__dirname + '/../client'));  //serve files in client
app.use(bodyParser.json())  // parse application/json

//function to configure the standard response handler
var configHandler = function(successCode,failCode,res){
  return function(err,data){
    if(err){
      res.status(failCode).send(err);
    }else{
      res.status(successCode).send(data);
    }
  }
}

//////////////////////////////////////////
//CREATE
//////////////////////////////////////////

//save a user to DB 
app.post('/api/user', function (req, res, next){
  db.addUser(req.body, configHandler(201,400,res));
  sendgrid.send({
    to:       'jwtippens@gmail.com',
    from:     'diyelpin@gmail.com',
    subject:  'Hello World',
    text:     'My first email through SendGrid.'
  }, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
  });
})

//add new family member to user
.post('/api/family/:userId',function (req,res,next){
  db.addFamilyMember(req.params, req.body, configHandler(201,400,res));
})

//add new history to user's family member
.post('/api/history/:userId/:familyId',function(req,res,next){
  db.addHistory(req.params, req.body, configHandler(201,400,res));
})


//////////////////////////////////////////
//READ
//////////////////////////////////////////
.get('/grid',function(req,res,next){
    sendgrid.send({
    to:       'jwtippens@gmail.com',
    from:     'diyelpin@gmail.com',
    subject:  'Hello World',
    text:     'My first email through SendGrid.'
  }, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
  });
})

// find a user
.get('/api/user/:userName/:password', function (req, res, next){
  db.verifyUser(req.params, configHandler(200,404,res));
})

//get all family info for a user
.get('/api/family/:userId',function(req,res,next){
  db.getAllFamily(req.params, configHandler(200,400,res));
})

//get a single family member
.get('/api/family/:userId/:familyId',function(req,res,next){
  db.getSingleFamilyMember(req.params, configHandler(200,400,res));
})


//get all actions
.get('/api/actions',function(req,res,next){
  db.getAllActions(configHandler(200,400,res));
})


//////////////////////////////////////////
//UPDATE
//////////////////////////////////////////

//update family member
.put('/api/family/:userId/:familyId',function (req,res,next){
  db.updateFamilyMember(req.params, req.body, configHandler(201,400,res));
})

//update history member
.put('/api/history/:userId/:familyId/:historyId',function (req,res,next){
  db.updateHistory(req.params, req.body, configHandler(201,400,res));
})


//////////////////////////////////////////
//DELETE
//////////////////////////////////////////

//delete family member
.delete('/api/family/:userId/:familyId',function (req,res,next){
  db.deleteFamilyMember(req.params, configHandler(201,400,res));
  sendgrid.send({
    to:       'jwtippens@gmail.com',
    from:     'diyelpin@gmail.com',
    subject:  'Hello World',
    text:     'My first email through SendGrid.'
  }, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
  });
})

//delete history
.delete('/api/history/:userId/:familyId/:historyId',function (req,res,next){
  db.deleteHistory(req.params, configHandler(201,400,res));
})


app.listen(port);
console.log('server listening on port ' + port + '...')
