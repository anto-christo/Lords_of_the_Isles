var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://202.177.241.26:27017/LOI';
var assert = require('assert');

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/',function(req,res){

    res.sendFile(__dirname+'/index.html');

});

server.listen(process.env.PORT || 3000,function(){
    console.log('Listening on '+server.address().port);
});


app.post('/player_name', function(req, res) {
  person = req.body.username;
  console.log(person);

  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);

  	var object = {
	      user : person,
	    };

    db.collection('players').find( { user:person } ).count(function(err,results){
      count = results;
      if (count>0) 
      {
          console.log("old player");
          
      }
      else
      { 
        console.log("new player");
        db.collection("players").insert(object, function(err, r) {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);
            db.close(); 
          });
      }
  });

  });

  res.redirect('/');
  
});



//--------------------------------------------------------------------------------------------------------------------

app.post('/island_info', function(req, res) {
  name = req.body.name;
  resource = req.body.resource;
  cap = req.body.cap;

  console.log(name);

  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);

    var object = {
        name : name,
        resource : resource,
        cap : cap
      };

   db.collection('islands').find( { name:name } ).count(function(err,results){
      count = results;
      if (count>0) 
      {
          res.send(JSON.stringify({'msg':'owned'}));
      }

      else
      { 
        db.collection("islands").insert(object, function(err, r) {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);
            db.close(); 
          });

        res.send(JSON.stringify({'msg':'new'}));
      }
  });

  });
  
});

