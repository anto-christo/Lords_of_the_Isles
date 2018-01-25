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

function assign_ship(uname, is_name, res){

  var s = new ship();

  s.owner_name = uname;
  s.source = is_name; 

  MongoClient.connect(url, function(err, db) {
    db.collection("ships").insert(s,function(err,result){

      // console.log(result);
      // console.log(result.insertedIds[0]);

      var id = result.insertedIds[0];

      db.collection("players").update({name:uname},{$push:{owned_ships_id:{id:id}}}, function(err, r) {
        assert.equal(null, err);
        db.close(); 
      });
    });
  });

}


io.on('connection', function(socket) {
    
    updateLeaderboard();
    socket.emit('getLeaderboard', rankings);
    setInterval(function(){ 
      updateLeaderboard();
      socket.emit('getLeaderboard', rankings);
    }, 2000);

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
  // console.log("\nINSIDE UPDATE LEADERBOARD\n");
    MongoClient.connect(url, function(err, db) {
       assert.equal(null, err);
                db.collection('players').find().sort({wealth:-1}).limit(5).toArray(function(err, results){
                      var j=0;
                      while(j<2){
                        var obj = {name: results[j].name,wealth: results[j].wealth}
                        rankings[j] = obj;
                        // console.log("obj" + obj);
                        j++;
                      }
                });
                db.close(); 
      });
}



var islands;

// var resources = [
//   "copper",
//   "iron",
//   "bronze",
//   "wood",
//   "oil",
//   "coal",
//   "uranium",
//   "lead",
//   "aluminium",
//   "diamond",
//   "emerald",
//   "coconut",
//   "salt",
//   "rice",
//   "wheat"
//   ];

  var common = [
    {name:"copper",base_cost:10},
    {name:"iron",base_cost:20},
    {name:"bronze",base_cost:30},
    {name:"wood",base_cost:40},
    {name:"coal",base_cost:50},
    {name:"lead",base_cost:60},
    {name:"rice",base_cost:70},
    {name:"wheat",base_cost:80},
    {name:"aluminium",base_cost:90}
  ];

  var rare = [
    {name:"oil",base_cost:200},
    {name:"uranium",base_cost:210},
    {name:"diamond",base_cost:220},
    {name:"emerald",base_cost:230},
    {name:"coconut",base_cost:240},
    {name:"salt",base_cost:250}
  ];
  
app.post('/create_island', function(req, res) {

  var island_name;
  var uname = req.body.username;

  fs.readFile('names.txt', function (err, data) {
    if (err) {
       return console.error(err);
    }

    islands = data.toString().split("\n");

    // for(k=0;k<islands.length;k++)
    // console.log(islands[k]);

    var rand = Math.floor(Math.random()*islands.length-1);
    // console.log(rand);
    // console.log(islands[rand]);

    island_name = islands[rand];

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

      db.collection("map").update({xpos:px, ypos:py}, {xpos:x, ypos:y}, function(err, result) {
        if(err) throw err;
      });

      var i = new island();

      var common_flag;
      
      db.collection("players").find({name:uname}).toArray(function(err, result) {
          // console.log("player gold: " + result[0].gold);

          if (result[0].gold<3000) // very poor
          {
              var random_res = Math.floor(Math.random()*(common.length-1));
              var resource = common[random_res].name;
              common_flag = 1;

          }
          else if (result[0].gold< 15000)  // middle class
          {
            var luck = Math.random()*10;
            if (luck>=7) 
            {
                var random_res = Math.floor(Math.random()*(rare.length-1));
                var resource = rare[random_res].name;
                common_flag = 0;


            }
            else
            {
                var random_res = Math.floor(Math.random()*(common.length-1));
                var resource = common[random_res].name;
                common_flag = 1;
            }
          }
          else // rich 
          {
              var luck = (Math.random()*10);
              if (luck>8) 
              {
                  var random_res = Math.floor(Math.random()*(rare.length-1));
                  var resource = rare[random_res].name;
                common_flag = 0;
              }
              else
              {
                  var random_res = Math.floor(Math.random()*(common.length-1));
                  var resource = common[random_res].name;
                common_flag = 1;
              }
          }


          var res_qty = Math.floor(Math.random()*200) + 30;
          var res_val = Math.floor(Math.random()*1000) + 100;
          var big = (Math.random()*2);
          if (big<1) 
          {
            var cap = Math.floor(Math.random()*1000) + 800;  
          }
          else
          {
            var cap = Math.floor(Math.random()*600) + 400;              
          }

          var current_pop = Math.floor(Math.random()*200) + 100;              

          // console.log("name="+island_name);

          var island_value;

          var production_factor;
          if (common_flag==1) 
          {
            production_factor = common[random_res].base_cost*5;
          }
          else
          {
            production_factor = rare[random_res].base_cost*10;
          }
          var population_factor  = current_pop*5;

          island_value = production_factor + population_factor;

          console.log("production_factor " + production_factor);
          console.log("population_factor " + population_factor);
          console.log("island_value " + island_value);

          i.x_cord = x;
          i.y_cord = y;
          i.res_produced.res_name = resource;
          i.res_produced.res_quantity = res_qty;
          i.res_produced.res_value = res_val;
          i.name = island_name;
          i.current_population = current_pop;
          i.max_population = cap;
          i.value = island_value;

          console.log(i);
          db.collection("islands").insert(i,function(err,result){
            res.send(JSON.stringify({"name":island_name}));
            db.close();
          });

        });
    });

  });
  
  }); 
    
});

app.post('/assign_island', function(req, res) {
  
  var uname = req.body.username;
  // console.log("uname="+uname);
  var is_name = req.body.island;
  console.log("isname="+is_name);
  var reply = req.body.reply;
  var old = req.body.old;

  // console.log("reply="+reply);
    
      if(reply == 'true'){
        MongoClient.connect(url, function(err, db) {
          db.collection("islands").update({name:is_name},{$set:{owner_name:uname}}, function(err, r) {
            // assert.equal(null, err);
            if(err)
            {
              console.log("booo!!");
            }

            // console.log("island updated");
            
            db.collection("players").update({name:uname},{$push:{owned_islands_name:{island_name:is_name}}}, function(err, r) {
              assert.equal(null, err);
              // console.log("owned updated");
              db.close();
        
              if(old==0)
                assign_ship(uname,is_name,res);
            });
          });
        });
      }

      else{
        MongoClient.connect(url, function(err, db) {

        db.collection("players").update({name:uname},{$push:{explored_islands_name:{island_name:is_name}}}, function(err, r) {
          assert.equal(null, err);
          // console.log("explored updated");
          db.close();
        });
      });
    }

    return res.send("Done");
  
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
  // console.log("\n\nIN PLAYER NAME\n");
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

  return res.send("Done");
  
});

app.post('/check_player', function(req, res) {

  var p = new player();
  
  p.name = req.body.username;

  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
    
    db.collection('players').find( { name:p.name } ).count(function(err,results){
      count = results;
      if (count>0) 
      {
          res.send(JSON.stringify({"player":"old"}));
      }
      else
      { 
        res.send(JSON.stringify({"player":"new"}));
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
        db.close();
      }
    );

  });
  
});


app.post('/get_island',function(req,res){

  var user = req.body.user;

  console.log(user);

  MongoClient.connect(url, function(err, db) {

    db.collection("players").find({name:user}).toArray(function(err, result) {
        return res.send(result);
        db.close();
    });

  });
});

app.post('/get_ship',function(req,res){

  var user = req.body.user;

  MongoClient.connect(url, function(err, db) {

    db.collection("ships").find({owner_name:user}).toArray(function(err, result) {
        return res.send(result);
        db.close();
    });

  });
});

app.post('/get_ship_info',function(req,res){

  var ship = req.body.ship;
  console.log(ship);

  MongoClient.connect(url, function(err, db) {

    db.collection("ships").find({_id:ship}).toArray(function(err, result) {
        return res.send(result);
        db.close();
    });

  });
});

app.post('/get_island_info',function(req,res){

  var island = req.body.island;

  MongoClient.connect(url, function(err, db) {

    db.collection("islands").find({name:island}).toArray(function(err, result) {
        return res.send(result);
        db.close();
    });

  });
});
