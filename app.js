var mongoose = require('mongoose');
var player = require('./models/players_schema');
var island = require('./models/islands_schema');
var ship = require('./models/ships_schema');
var bank = require('./models/bank_schema');

var express = require('express');
var fs = require("fs");
var app = express();

var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/LOI';

var assert = require('assert');

var rankings= [];
var gold = 0;
var p = new player();

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/',function(req,res){

    res.sendFile(__dirname+'/index.html');

});

server.listen(process.env.PORT || 3000,function(){
    console.log('Listening on '+server.address().port);
});

// io.on('connection', function(socket) {
//     updateLeaderboard();
//     socket.emit('getLeaderboard', rankings);
//     setInterval(function(){ 
//       updateLeaderboard();
//       socket.emit('getLeaderboard', rankings);
//     }, 10000);


//     updateGold();
//     socket.emit('getGold', gold);
//     setInterval(function(){ 
//       updateGold();
//       socket.emit('getGold', gold);
//     }, 5000);



// });

// function updateLeaderboard(){
//     MongoClient.connect(url, function(err, db) {
//        assert.equal(null, err);
//                 db.collection('players').find().sort({wealth:-1}).limit(5).toArray(function(err, results){
//                       var j=0;
//                       while(j<5){
//                         var obj = {name: results[j].name,wealth: results[j].wealth}
//                         rankings[j] = obj;
//                         j++;
//                       }
//                 });
//                 db.close(); 
//       });
// }

// function updateGold(){
//     MongoClient.connect(url, function(err, db) {
//        assert.equal(null, err);
//        // global_user = "newbie"; // uncomment later. when commented, works only if entry is through index.html
//        console.log("global_user "+ global_user);
//                 db.collection('players').find({name:global_user}).toArray(function(err, results){
//                      gold = results[0].gold;
//                 });
//                 db.close(); 
//       });
// }

var islands;
var resources = ["copper","iron","bronze","wood","oil","coal","uranium","lead","aluminium","diamond","emerald","coconut","salt","rice","wheat"];
  
app.post('/assign_island', function(req, res) {

  var p = new player();
  p.name = req.body.username;

  fs.readFile('names.txt', function (err, data) {
    if (err) {
       return console.error(err);
    }

    islands = data.toString().split("\n");

    for(i=0;i<islands.length;i++)
    console.log(islands[i]);

    var rand = Math.floor(Math.random()*islands.length-1);
    console.log(rand);
    console.log(islands[rand]);

    var island_name = islands[rand];

    var ind = islands.indexOf(island_name);

    if(ind != -1){
      islands.splice(ind,1);
    }

    for(i=0;i<islands.length;i++)
    console.log(islands[i]);

    var new_list = islands.join("\n");

    fs.writeFile('names.txt',new_list,  function(err) {
      if (err) {
         return console.error(err);
      }
      
      console.log("Data written successfully!");     
   });

   MongoClient.connect(url, function(err, db) {

    var x;
    var y;

    db.collection("map").find({}).toArray(function(err, result) {
      assert.equal(null, err);
      x = result[0].xpos;
      y = result[0].ypos;

      if(x<1000){
        var randx = Math.floor(Math.random()*200)+50;
        console.log(randx);
        var px = x;
        var py = y;
        x+=randx;
      }

      else{
        var randy = Math.floor(Math.random()*200)+50;
        var py = y;
        var px = x;
        x=10;
        y+=randy;
      }

      db.collection("map").update({xpos:px, ypos:py}, {xpos:x, ypos:y}, function(err, result) {
        if(err) throw err;
      });

      var i = new island();

      var random_res = Math.floor(Math.random()*(resources.length-1));
      var resource = resources[random_res];

      var cap = Math.floor(Math.random()*1000) + 30;

      i.xpos = x;
      i.ypos = y;
      i.name = island_name;
      i.resource = resource;
      i.cap = cap;

      var island_details = {
        x_cord : i.xpos,
        y_cord : i.ypos,
          name : i.name,
          res_produced : i.resource,
          max_population : i.cap
      };

      db.collection("islands").insert(island_details, function(err, r) {
        assert.equal(null, err);
        assert.equal(1, r.insertedCount);
        res.send(JSON.stringify({'imsg':'success'}));
      });

      db.collection("players").update({name:p.name},{$push:{explored_islands_name:{island_name:i.name}}}, function(err, r) {
        assert.equal(null, err);
        console.log("player updated");
        db.close(); 
      });


    });  
      
  
    });
 });

});

app.post('/player_name', function(req, res) {
  
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

app.post('/island_nos', function(req, res) {
  
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
    
    db.collection('islands').find( {} ).count(function(err,results){
      count = results;
      
      return res.send(count);
  });

  });
  
});



app.get('/getLeaderboard', function(req, res) {

    var results;
    MongoClient.connect(url, function(err, db) {
       assert.equal(null, err);
                db.collection('players').find().sort({wealth:-1}).limit(5).toArray(function(err, results){
                      return res.send(results);
                });
                db.close(); 
      });

});
