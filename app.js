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
var clients = {};
var gold = 0;

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/',function(req,res){

    res.sendFile(__dirname+'/index.html');

});

server.listen(process.env.PORT || 3000,function(){
    console.log('Listening on '+server.address().port);
});

function assign_ship(uname, is_name){

  var s = new ship();

  s.owner_name = uname;
  s.source = is_name; 

  MongoClient.connect(url, function(err, db) {
    db.collection("ships").insert(s,function(err,result){

      console.log(result);
      console.log(result.insertedIds[0]);

      var id = result.insertedIds[0];

      db.collection("players").update({name:uname},{$push:{owned_ships_id:{id:id}}}, function(err, r) {
        assert.equal(null, err);
        db.close(); 
      });
    });
  });
}

function create_island(x,y,island_name){

    var i = new island();

    var random_res = Math.floor(Math.random()*(resources.length-1));
    var resource = resources[random_res];

    var cap = Math.floor(Math.random()*1000) + 30;

    console.log("name="+island_name);

    i.x_cord = x;
    i.y_cord = y;
    i.res_produced = resource;
    i.name = island_name;
    i.max_population = cap;

    console.log(i);

    MongoClient.connect(url, function(err, db) {
    db.collection("islands").insert(i);
    db.close();
    });
}


function update_map(x,y,px,py){
  MongoClient.connect(url, function(err, db) {

  db.collection("map").update({xpos:px, ypos:py}, {xpos:x, ypos:y}, function(err, result) {
    if(err) throw err;
    db.close();
  });

});
}
io.on('connection', function(socket) {
    
    updateLeaderboard();
    socket.emit('getLeaderboard', rankings);
    setInterval(function(){ 
      updateLeaderboard();
      socket.emit('getLeaderboard', rankings);
    }, 10000);

	socket.on('add-user', function(data){
	    clients[data.username] = {
	      "socket": socket.id
	    };

    });

    socket.on('getGold', function(data){
      var my_gold;
      if (clients[data.username]){
      MongoClient.connect(url, function(err, db) {
       assert.equal(null, err);
                db.collection('players').find({name:data.username}).toArray(function(err, results){
                    io.sockets.connected[clients[data.username].socket].emit("responseGold", results[0].gold);
                });
                db.close(); 
      });
      }
      else {
        console.log("User does not exist: " + data.username); 
      }
    	
    });

    socket.on('disconnect', function() {
    for(var name in clients) {
      if(clients[name].socket === socket.id) {
        delete clients[name];
        break;
      }
    } 
  })

});


function updateLeaderboard(){
    MongoClient.connect(url, function(err, db) {
       assert.equal(null, err);
                db.collection('players').find().sort({wealth:-1}).limit(5).toArray(function(err, results){
                      var j=0;
                      while(j<0){
                        var obj = {name: results[j].name,wealth: results[j].wealth}
                        rankings[j] = obj;
                        j++;
                      }
                });
                db.close(); 
      });
}



var islands;
var resources = ["copper","iron","bronze","wood","oil","coal","uranium","lead","aluminium","diamond","emerald","coconut","salt","rice","wheat"];
  
app.post('/create_island', function(req, res) {

  var island_name;

  fs.readFile('names.txt', function (err, data) {
    if (err) {
       return console.error(err);
    }

    islands = data.toString().split("\n");

    for(k=0;k<islands.length;k++)
    console.log(islands[k]);

    var rand = Math.floor(Math.random()*islands.length-1);
    // console.log(rand);
    // console.log(islands[rand]);

    island_name = islands[rand];

    res.send(JSON.stringify({"name":island_name}));

    var ind = islands.indexOf(island_name);

    if(ind != -1){
      islands.splice(ind,1);
    }

    // for(i=0;i<islands.length;i++)
    // console.log(islands[i]);

    var new_list = islands.join("\n");

    fs.writeFile('names.txt',new_list,  function(err) {
      if (err) {
         return console.error(err);
      }
      
      // console.log("Data written successfully!");     
   });

   var x,y,px,py;

   MongoClient.connect(url, function(err, db) {

    db.collection("map").find({}).toArray(function(err, result) {
      assert.equal(null, err);
      x = Number(result[0].xpos);
      y = Number(result[0].ypos);

      if(x<1000){
        var randx = Math.floor(Math.random()*200)+50;
        console.log(randx);
        px = x;
        py = y;
        x+=randx;
      }

      else{
        var randy = Math.floor(Math.random()*200)+50;
        py = y;
        px = x;
        x=10;
        y+=randy;
      }

      update_map(x,y,px,py);
      create_island(x,y,island_name);

      db.close();

    });

  });
  
  }); 
    
});

app.post('/assign_island', function(req, res) {
  
  uname = req.body.username;
  console.log("uname="+uname);
  is_name = req.body.island;

  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
    
    db.collection("islands").update({name:is_name},{$set:{owner_name:uname}}, function(err, r) {
      assert.equal(null, err);
      console.log("island updated");
      db.close(); 
    });

      db.collection("players").update({name:uname},{$push:{explored_islands_name:{island_name:is_name}}}, function(err, r) {
        assert.equal(null, err);
        // console.log("player updated");
        db.close(); 
      });

  });

  assign_ship(uname,is_name);
  
});

function insert_player(p){
  console.log("new player");
  MongoClient.connect(url, function(err, db) {
        db.collection("players").insert(p);
        db.close();
  });
}

app.post('/player_name', function(req, res) {

  var p = new player();
  
  p.name = req.body.username;


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
        insert_player(p);
      }

      db.close();
  });

  });
  
});

app.post('/old_island', function(req, res) {

  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
    
    db.collection("islands").aggregate(
      { $sample: { size: 1 } }, function(err,result){
        return res.send(result);
      }
    );

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
