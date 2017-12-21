var mongoose = require('mongoose');
var player = require('models/players_schema');
var island = require('models/islands_schema');
var ship = require('models/ships_schema');
var bank = require('models/bank_schema');

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
  
  var p = new player();
  p.name = req.body.username;
  console.log(p.name);

  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
    
    db.collection('players').find( { name:p.name } ).count(function(err,results){
      count = results;
      if (count>0) 
      {
          console.log("old player");
      }
      else
      { 
        console.log("new player");
        db.collection("players").insert(p);
      }
  });

  });
  
});






//--------------------------------------------------------------------------------------------------------------------

// app.post('/island_info', function(req, res) {
//   name = req.body.name;
//   resource = req.body.resource;
//   cap = req.body.cap;
//   xpos = req.body.xpos;
//   ypos = req.body.ypos;

//   console.log(xpos+","+ypos);

//   MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);

//     var object = {
//         xpos : xpos,
//         ypos : ypos,
//         name : name,
//         resource : resource,
//         cap : cap
//       };

//       db.collection('islands').find( { $or:[{xpos:{$gt:(xpos-100)}}, {xpos:{$lt:(xpos+100)}}, {ypos:{$gt:(ypos-100)}}, {ypos:{$lt:(ypos+100)}} ] } )
//       .count(function(err,results){

//           if(results > 0){
//               res.send(JSON.stringify({'msg':'near'}));
//           }

//           else{

//               db.collection('islands').find( { name:name } ).count(function(err,results){
//               count = results;
//               if (count>0) 
//               {
//                   res.send(JSON.stringify({'msg':'owned'}));
//               }

//               else
//               { 
//                 db.collection("islands").insert(object, function(err, r) {
//                     assert.equal(null, err);
//                     assert.equal(1, r.insertedCount);
//                     db.close(); 
//                   });

//                 res.send(JSON.stringify({'msg':'new'}));
//               }
//             });
//           }

//       });

//   });
  
// });

app.get('/prev_pos', function(req, res){

  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);

      db.collection("map").find({}).toArray(function(err, result) {
        assert.equal(null, err);
        res.send(result);
        db.close();
    });
  });

});

app.post('/update_map', function(req, res) {

  pxpos = req.body.pxpos;
  xpos = req.body.xpos;
  pypos = req.body.pypos;
  ypos = req.body.ypos;

  console.log(pxpos+","+xpos+","+pypos+","+ypos);

  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);

    db.collection("map").update({xpos:pxpos, ypos:pypos}, {xpos:xpos, ypos:ypos}, function(err, result) {
      if(err) throw err;

      res.send(JSON.stringify({'msg':'success'}));
      db.close();
    });

  });
  
 });

app.post('/island_info', function(req, res) {
  name = req.body.name;
  resource = req.body.resource;
  cap = req.body.cap;
  xpos = req.body.xpos;
  ypos = req.body.ypos;

  console.log(name);

  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);

    var object = {
        xpos : xpos,
        ypos : ypos,
        name : name,
        resource : resource,
        cap : cap
      };

    db.collection("islands").insert(object, function(err, r) {
      assert.equal(null, err);
      assert.equal(1, r.insertedCount);
      res.send(JSON.stringify({'msg':'success'}));
      db.close(); 
    });

  });

});



app.post('/island_check', function(req, res) {
  name = req.body.name;

  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);


          db.collection('islands').find( { name:name } ).count(function(err,results){
          count = results;
          if (count>0) 
          {
                  res.send(JSON.stringify({'msg':'owned'}));
          }

          else
          { 
             res.send(JSON.stringify({'msg':'new'}));
          }
    });

  });

});

