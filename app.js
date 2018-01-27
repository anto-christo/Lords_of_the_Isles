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



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////     ASSIGN SHIP       /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function assign_ship(uname, is_name){

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

app.post('/buy_ship',function(req,res){

  var uname = req.body.user;
  var is_name = req.body.island;

  assign_ship(uname, is_name);

  return res.send("Done");
});




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////     SOCKETS       /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




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

      MongoClient.connect(url, function(err, db) {
       assert.equal(null, err);
          db.collection('players').find({name:data.username}).toArray(function(err, results){
              io.sockets.connected[clients[data.username].socket].emit("setLocalStorage", results[0].owned_islands_name[0].island_name);
          });
          db.close(); 
      });

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
                db.collection('players').find().sort({total_wealth:-1}).limit(5).toArray(function(err, results){
                      var j=0;
                      while(j<1){
                        var obj = {name: results[j].name,total_wealth: results[j].total_wealth}
                        rankings[j] = obj;
                        // console.log("obj" + obj);
                        j++;
                      }
                });
                db.close(); 
      });
}




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////     CREATE ISLAND       ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




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
    {name:"copper",base_cost:5}, //0
    {name:"iron",base_cost:5},  //1
    {name:"bronze",base_cost:5},  //2
    {name:"wood",base_cost:6},  //3
    {name:"coal",base_cost:6}, //4
    {name:"lead",base_cost:8},  //5
    {name:"rice",base_cost:8},  //6
    {name:"wheat",base_cost:10},  //7
    {name:"aluminium",base_cost:10}  //8
  ];

  var rare = [
    {name:"oil",base_cost:20},  //9
    {name:"uranium",base_cost:20},  //10
    {name:"diamond",base_cost:25},  //11
    {name:"emerald",base_cost:25},  //12
    {name:"coconut",base_cost:30},  //13
    {name:"salt",base_cost:30} //14
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

      var common_flag = 0;
      
      db.collection("players").find({name:uname}).toArray(function(err, result) {
          // console.log("player gold: " + result[0].gold);

          if (result[0].gold<3500) // very poor
          {
              var random_res = Math.floor(Math.random() * (8 - 0 + 1)) + 0;
              var resource = common[random_res].name;
              common_flag = 1;

          }
          else if (result[0].gold< 15000)  // middle class
          {
            var luck = Math.random() * (10 - 1 + 1) + 1;
            if (luck>=7) 
            {
                var random_res = Math.floor(Math.random() * (5 - 0 + 1)) + 0;
                var resource = rare[random_res].name;
                common_flag = 0;
            }
            else
            {
                var random_res = Math.floor(Math.random() * (8 - 0 + 1)) + 0;
                var resource = common[random_res].name;
                common_flag = 1;
            }
          }
          else // rich 
          {
              var luck = (Math.random()*10);
              if (luck>8) 
              {
                  var random_res = Math.floor(Math.random() * (5 - 0 + 1)) + 0;
                  var resource = rare[random_res].name;
                  common_flag = 0;
              }
              else
              {
                  var random_res = Math.floor(Math.random() * (8 - 0 + 1)) + 0;
                  var resource = common[random_res].name;
                  common_flag = 1;
              }
          }

          var index;
          

          var production_factor;
          if (common_flag==1) 
          {
            production_factor = common[random_res].base_cost*5;
            index = random_res;
          }
          else
          {
            production_factor = rare[random_res].base_cost*10;
            index = random_res + 9;
          }
          // console.log("index : "+index);
         
          db.collection("res").update({index:index},{$inc:{ct:1}});

           // var res_qty = Math.floor(Math.random()*200) + 30;
          // var res_val = Math.floor(Math.random()*1000) + 100;
          // Math.floor(Math.random() * (max - min + 1)) + min; // gives between min and max both inclusive
          var big = Math.random() * (2 - 0 + 1) + 0; 
          if (big<1) 
          {
            // var cap = 50*(Math.floor(Math.random()*20) + 16);
            var cap = 50*(Math.floor(Math.random() * (20 - 16 + 1)) + 16);
          }
          else
          {
            // var cap = 50*(Math.floor(Math.random()*12) + 8);           
            var cap = 50*(Math.floor(Math.random() * (12 - 8 + 1)) + 8);              
          }

          var current_pop = Math.floor(Math.random() * (200 - 100 + 1)) + 100;              

          // console.log("name="+island_name);

          db.collection("res").find({}).toArray(function(err, result1) {
              // console.log("\n\nCOUNT : "+ result1[index].ct);
              var sum = 0; // sum is the total no. of islands on map
              var this_res = result1[index].ct;
              for (var j =0; j < 15; j++) {
                  sum = sum + result1[j].ct;
                  // console.log("sum :"+sum);
                  // console.log("result1[j].ct :"+result1[j].ct);

              }
              if (sum > 0) 
              {
                  if (this_res>0) 
                  {
                      production_factor = production_factor*(sum/this_res);
                  }
              }
              
              // console.log("sum :"+sum);

              // console.log("production_factor :"+production_factor); // if commented, island value becomes NAN ???
          
                var population_factor  = current_pop*5;
                island_value = production_factor + population_factor;
                if (big<1) 
                {
                  island_value = island_value + 400;
                }
                island_value =  Math.floor(island_value);

                console.log("island value : " + island_value);
                i.x_cord = x;
                i.y_cord = y;
                i.res_produced.res_name = resource;
                // i.res_produced.res_quantity = res_qty;
                // i.res_produced.res_value = res_val;
                i.name = island_name;
                i.current_population = current_pop;
                i.max_population = cap;
                i.value = island_value;
                console.log(i);
                
                db.collection("islands").insert(i,function(err,result){
                  res.send(JSON.stringify({"name":island_name}));
                      var resource_name;
                       for (var k = 0; k < 15; k++) {
                        if (k < 9) 
                        {
                          resource_name = common[k].name;
                          db.collection("islands").update({name:island_name},{$push:{res_present:{name:resource_name,quantity:0}}});
                        }
                        else
                        {
                          resource_name = rare[k-9].name;
                          db.collection("islands").update({name:island_name},{$push:{res_present:{name:resource_name,quantity:0}}});
                        }
                      }
                    db.close();
                });

          }); 

        });
    });

  });
  
  }); 
    
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////     ASSIGN ISLAND       ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



app.post('/assign_island', function(req, res) {
  
  var uname = req.body.username;
  // console.log("uname="+uname);
  var is_name = req.body.island;
  // console.log("isname="+is_name);
  var reply = req.body.reply;
  var old = req.body.old;

  // console.log("reply="+reply);
      var buyed = 0;
      if(reply == 'true'){
        MongoClient.connect(url, function(err, db) {
              
              db.collection("islands").find({name:is_name}).toArray(function(err, result) {
                  // console.log("result[0].value "+result[0].value);
                  var island_cost = result[0].value;
                  db.collection("players").find({name:uname}).toArray(function(err,result){
                      var player_gold = result[0].gold;
                      // console.log("player_gold: "+ player_gold);
                      // console.log("island_cost: "+ island_cost);
                      if (player_gold >= island_cost)  // console.log("can buy");
                      {
                        if (old==1) 
                        {
                            db.collection("players").update({name:uname},{$inc:{gold:-island_cost}}, function(err, r) {
                              assert.equal(null, err);
                              // reducing player gold here
                            });
                        }
                        
                         db.collection("players").update({name:uname},{$inc:{island_wealth:island_cost,total_wealth:island_cost}}, function(err, r) {
                            assert.equal(null, err);
                            // +island value to wealth if new island buyed / home island
                         });
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
                            res.send({"message":"success"});
                            db.close();
                      
                            if(old==0)
                              assign_ship(uname,is_name);
                          });
                        });
                        // console.log("INSIDE BUYED");

                        buyed = 1;

                      }
                      else  // cannot buy
                      {
                        explored();
                        return res.send({"message":"failure"});
                      }
                  });
              });
        });
      }

      else{
        // console.log("INSIDE NOT BUYED");
        explored();
        return res.send({"message":"success"});
      } 

    function explored(){
    MongoClient.connect(url, function(err, db) {
        db.collection("players").update({name:uname},{$inc:{island_wealth:25,total_wealth:25}}, function(err, r) {
          assert.equal(null, err);
          // +25 wealth if new island explored (not buyed)
        });
        db.collection("players").update({name:uname},{$push:{explored_islands_name:{island_name:is_name}}}, function(err, r) {
          assert.equal(null, err);
          //  SEND ERROR MESSAGE , NOT ENOUGH GOLD
          // console.log("explored updated");
          db.close();
        });
      });
  }
  
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////     PLAYER       //////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////     MISCELLANEOUS       ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





app.post('/get_island',function(req,res){

  var user = req.body.user;

  // console.log(user);

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
  // console.log(ship);

  MongoClient.connect(url, function(err, db) {

    var ObjectId = new mongoose.Types.ObjectId(ship);

    db.collection("ships").find({_id:ObjectId}).toArray(function(err, result) {
        // console.log(result);
        return res.send(result);
        db.close();
    });

  });
});

app.post('/rename_ship',function(req,res){

  var ship = req.body.ship;
  var name = req.body.name;
  // console.log(ship);
  // console.log(name);

  MongoClient.connect(url, function(err, db) {

    var ObjectId = new mongoose.Types.ObjectId(ship);

    db.collection("ships").update({_id:ObjectId},{$set:{name:name}},function(err, result) {
        return res.send("Done");
        db.close();
    });

  });
});

app.post('/get_island_info',function(req,res){

  var island = req.body.island;

  MongoClient.connect(url, function(err, db) {

    db.collection("islands").find({name:island}).toArray(function(err, result) {
        // console.log("get_island_info: "+result);
        return res.send(result);
        db.close();
    });

  });
});

app.post('/send_ship',function(req,res){

  var ship = req.body.ship;
  var names = req.body.names;
  var qtys = req.body.qtys;
  var dest = req.body.dest;
  var src = req.body.src;

  // console.log(names.length);
  // console.log(qtys);
  // console.log(src);

  var doc = [];

    for(i=0;i<names.length;i++){

      var num = Number(qtys[i]);

        if(qtys[i]!=0)
        {
          var obj = {name: names[i], quantity:num};
          doc.push(obj);
        }
    }

  // console.log(doc);

  MongoClient.connect(url, function(err, db) {

    var ObjectId = new mongoose.Types.ObjectId(ship);

    db.collection('ships').update({_id:ObjectId}, {$set:{res_present:[]}}, {multi:true},function(err,result){
      // console.log("Removed");
    });

    db.collection('ships').update({_id:ObjectId}, {$set:{res_present: doc, destination:dest}}, function(err,result){
      // console.log("Updated");

      for(var k in doc){

        var qty = Number(doc[k].quantity);

        // console.log("Qty="+qty);

        db.collection('islands').find( { name:src,  res_present:{$elemMatch: {name:doc[k].name}} } ).count(function(err,results){
               // console.log("result="+results);

            if(results > 0){
              db.collection("islands").update({name:src, "res_present.name":doc[k].name}, {$inc:{"res_present.$.quantity":-qty}},function(err, result) {
                // console.log("res present decremented");
              });
            }

            else{
              db.collection("islands").update({name:src}, {$inc:{"res_produced.res_quantity":-qty}},function(err, result) {
                // console.log("res produced decremented");
              });
          
            }
        
        });
      }
    });

    setTimeout(function(){
      
      for(var k in doc){

        var qty = Number(doc[k].quantity);

        db.collection('islands').find( { name:dest,  res_present:{$elemMatch: {name:doc[k].name}} } ).count(function(err,results){
               // console.log("result="+results);

            if(results == 0){
            db.collection('islands').update({name:dest},{$push:{res_present:doc[k]}}, function(err,result){
              // console.log("push complete");
              // console.log("reached");
            });
            }

            else{
            db.collection("islands").update({name:dest, "res_present.name":doc[k].name}, {$inc:{"res_present.$.quantity":qty}},function(err, result) {
              // console.log("Set complete");
              // console.log("reached");
            });
          
            }
        
        });
      }
    }, 5000);

    return res.send("Done");
    db.close();

  });
});






/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////     TICK CHANGED       ////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



app.post('/tick_changed', function(req, res) {
  // console.log("\n\nTICK CHANGED\n\n");
  var uname = req.body.username;
      // 1) increase pop on all islands of all players
      // 2) .... res ....
      // 3) ships landing on that tick ka unloading of goods
      // 4) wealth calculation
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
    db.collection("players").find({name:uname}).toArray(function(err,result){
        var total_wealth = Math.floor(result[0].island_wealth + (result[0].gold/5));
        db.collection("players").update({name:uname},{$set:{total_wealth:total_wealth}})
        db.close();
    });
  }); 

});


var m,min;
    var s,sec;
    var h,ms;
    var d;
    var sum,n,n1;
    var temp;
    var t;
    var current_tick = 0;

    setInterval(function(){ 
      myFunction()
    }, 1000);

  function addZero(x,n) {
      while (x.toString().length < n) {
          x = "0" + x;
      }
      return x;
  }
  

  var dur = 1; // 10 mins i.e. 6 ticks per hour
  var duration = dur* 60; 
  var adjust;
  function myFunction() {
  var sum = m*60+h*3600+n*86400; // in secs
    d = new Date();
    n = d.getUTCDate();
    n1 = 20;                      //IMPORTANT : LATER MAKE N1 THE STARTING DATE OF MEGA EVENT
      adjust = n1*24*(60/dur);

      h = addZero(d.getUTCHours(), 2);
      m = addZero(d.getUTCMinutes(), 2);  
      s = addZero(d.getUTCSeconds(), 2);

      sec = addZero(60 - s, 2);
      min = 60 - m -1 ;
      t = parseInt(min/dur);
      min = min - (t*dur);
      temp = sum / duration;
      current_tick = parseInt(temp) - adjust ;
      console.log("timer: "+min + ":" + sec);
      
      if (s == "01") 
      {
          console.log("SERVER SIDE TICK CHANGED");
          newTick();
      }
      
  }


function newTick(){

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
    // update res on all islands of all players
    db.collection("islands").find().forEach(function(data){
        console.log("island_name:" + data.name);
        console.log("production:" + data.res_produced.res_name);
        var produced = Math.floor(data.current_population / 10);
        console.log("produced:" + produced);

        db.collection("islands").update(
            {name:data.name,"res_present.name":data.res_produced.res_name},
            {$inc:{"res_present.$.quantity":produced}},
            function(err,res){
            db.close();
        });


    });

  });


}





