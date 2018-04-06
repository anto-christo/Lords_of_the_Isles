var mongoose = require('mongoose');
var player = require('./models/players_schema');
var island = require('./models/islands_schema');
var ship = require('./models/ships_schema');
var bank = require('./models/bank_schema');
var bonus = require('./models/bonuses_schema');

var express = require('express');
var fs = require("fs");
var app = express();

var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/LOI';
var wacky = 'mongodb://127.0.0.1:27017/wacky';
var escape = 'mongodb://127.0.0.1:27017/game';
var assert = require('assert');

var rankings= [];
var clients = {};

var sponsors = [
  "casio",
  "festpav",
  "frapp",
  "imperial",
  "jamboree",
  "lenskart",
  "metro",
  "spykar",
  "starbucks"
]


const environment = "development";  ///change it to "production" when the game is deployed on the teknack servers

const sessions = require("client-sessions");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sessionMiddleware = sessions({
    cookieName: 'sess',
    secret: 'dws9iu3r42mx1zvh6k5m',
    duration: 2 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 60
})

app.use(sessionMiddleware);

app.post("/setSession", function (req, res) {
    req.sess.username = req.body.username;    // username is stored in sess variable
    // req.sess.username = 'Akash';    // username is stored in sess variable
    // console.log(req.sess.username + " logged in");  // username can be accessed using req.sess.username
    res.sendStatus(200);
    
});

app.get("/unsetSession", function (req, res) {
    if (environment == "development") {
        req.sess.username = null;
        res.sendStatus(200);
    } else if (environment == "production") {
        res.sendStatus(400);
    }
});


app.use(function (req, res, next) {
    if (!req.sess.username) {
        let login = `<script>
        var username = prompt("Enter username");
        if (username) {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    window.location = "/";
                }
            };
            xhttp.open("POST", "/setSession", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("username=" + username);
    
        }
    </script>`;
        if (environment == "development") {
            res.send(login);
        } else if (environment == "production") {
            res.redirect('https://teknack.in');
        }
    } else {
        next();
    }
});

app.post('/get_username', function(req, res) {
  var person = req.sess.username;
  // console.log("in get username "+person);
  var player = {
        name:person
    }
    // for (var i = 0; i < clients.length; i++) {
    // 	console.log("clients"+clients[i]);
    	
    // }
    return res.send(player);
});

app.use(express.static(__dirname+'/public'));
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/',function(req,res){

    res.sendFile(__dirname+'/index.html');

});

server.listen(process.env.PORT || 3008,function(){
    console.log('Listening on '+server.address().port);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////     BONUSES       /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function update_wacky(name,l){
MongoClient.connect(url, function(err, db) {
     assert.equal(null, err);
        db.collection('bonuses').find({player_name:name}).toArray(function(err, results1){
          if (results1.length>0) 
          {
            // console.log("results1[0].wacky_keyboard[0].level3" + results1[0].wacky_keyboard[0].level3);
            if (results1[0].wacky_keyboard[2].level3==0&&l>2) 
            {
              db.collection("players").update({name:name},{$inc:{gold:5000}});
              db.collection("bonuses").update({player_name:name,'wacky_keyboard.level3':0},{$set:{'wacky_keyboard.$.level3':1}});
            }
            if (results1[0].wacky_keyboard[1].level2==0&&l>1) 
            {
              db.collection("players").update({name:name},{$inc:{empty_ship_slots:1}});
              db.collection("bonuses").update({player_name:name,'wacky_keyboard.level2':0},{$set:{'wacky_keyboard.$.level2':1}});
            }
            if (results1[0].wacky_keyboard[0].level1==0) 
            {
              db.collection("players").update({name:name},{$inc:{gold:1000}});
              db.collection("bonuses").update({player_name:name,'wacky_keyboard.level1':0},{$set:{'wacky_keyboard.$.level1':1}});
            }
          }
          setTimeout(function(){
              db.close(); 
          },1000)
          
        });
    });
}




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////     SOCKETS       /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


io.on('connection', function(socket) {

     
    
    updateLeaderboard();
    socket.emit('getLeaderboard', rankings);
    setInterval(function(){ 
      updateLeaderboard();
      socket.emit('getLeaderboard', rankings);
    }, 5000);


    socket.on('get_first_island', function(data){
    	MongoClient.connect(url, function(err, db) {
	       assert.equal(null, err);
	       // console.log(" get_first_island data.username "+data.username);
	          db.collection('players').find({name:data.username}).toArray(function(err, results){
	            // setTimeout(function(){
	              io.sockets.connected[clients[data.username].socket].emit("setLocalStorage", results[0].owned_islands_name[0].island_name);
	            // },500)
	            db.close(); 
	          });
	      });
    });


	socket.on('add-user', function(data){
		// console.log("in add-user data.username "+data.username);
	    clients[data.username] = {
	      "socket": socket.id
	    };

	    // for (var j in clients) 
	    //  {
	    //   console.log(j);
	    //  }

      // MongoClient.connect(wacky, function(err, db) {
      //  assert.equal(null, err);
      //     db.collection('scores').find({user:data.username}).toArray(function(err, results){
      //       if (results.length>0) 
      //       {
      //         // console.log("wacky score: "+results[0].score);	
      //         if (results[0].score >= 100 && results[0].score < 150) 
      //         {
      //            update_wacky(data.username,1);
      //         }
      //         if (results[0].score >= 150 && results[0].score < 250) 
      //         {
      //            update_wacky(data.username,2);
      //         }
      //         if (results[0].score >= 250) 
      //         {
      //            update_wacky(data.username,3);
      //         }
      //         // io.sockets.connected[clients[data.username].socket].emit("wacky_bonus", results[0].score);
      //       }
      //       db.close(); 
      //     });
      // });

    });

    socket.on('getGold', function(data){
      var my_gold;
      // console.log("get gold:" + data.username)
      // console.log(clients[data.username]);
      if (clients[data.username]){
      MongoClient.connect(url, function(err, db) {
       assert.equal(null, err);
          db.collection('players').find({name:data.username}).toArray(function(err, results){
              io.sockets.connected[clients[data.username].socket].emit("responseGold", results[0].gold);
              db.close(); 
          });
      });
      }
      else {
        console.log("User does not exist: " + data.username); 
      }
    	
    });

    socket.on('myRank', function(data){
      var results;
      var rank = {
          rank:0,
          wealth: 0
      }
      var counter = 0;
      if (clients[data.username]){
      MongoClient.connect(url, function(err, db) {
       assert.equal(null, err);
          db.collection('players').find().toArray(function(err, results){
                results.sort(function(a, b){
                  return b.total_wealth - a.total_wealth;
                });
                while(results[counter].name!=data.username){
                    counter++;
                }
                rank.rank = counter+1;
                rank.wealth = results[counter].total_wealth;
                io.sockets.connected[clients[data.username].socket].emit("responseRank", rank);
                db.close(); 
          });
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
    socket.conn.close ();
  })

});


function updateLeaderboard(){
  // console.log("\nINSIDE UPDATE LEADERBOARD\n");
    MongoClient.connect(url, function(err, db) {
       assert.equal(null, err);
          db.collection('players').find().sort({total_wealth:-1}).limit(5).toArray(function(err, results){
                var j=0;
                while(j<results.length){
                  var obj = {name: results[j].name,total_wealth: results[j].total_wealth}
                  rankings[j] = obj;
                  // console.log("obj" + obj);
                  j++;
                }
              db.close(); 
          });
      });
}




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////     CREATE ISLAND       ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




var islands;

  var common = [
    {name:"bread",base_cost:5}, //0
    {name:"fruits",base_cost:5},  //1
    {name:"cheese",base_cost:5},  //2
    {name:"wood",base_cost:6},  //3
    {name:"stone",base_cost:6}, //4
    {name:"wheat",base_cost:8},  //5
    {name:"bamboo",base_cost:8},  //6
    {name:"ale",base_cost:10},  //7
    {name:"cotton",base_cost:10}  //8
  ];

  var rare = [
    {name:"silk",base_cost:20},  //9
    {name:"honey",base_cost:20},  //10
    {name:"fur",base_cost:22},  //11
    {name:"gems",base_cost:22},  //12
    {name:"chocolate",base_cost:24},  //13
    {name:"spices",base_cost:24} //14
  ];
  
app.post('/create_island', function(req, res) {

  var island_name;
  var uname = req.body.username;
  // console.log("user:" + uname);
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


    var new_list = islands.join("\n");

    fs.writeFile('names.txt',new_list,  function(err) {
      if (err) {
         return console.error(err);
      }
      
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

          db.collection("res").find({}).toArray(function(err, result1) {
              var sum = 0; // sum is the total no. of islands on map
              var this_res = result1[index].ct;
              for (var j =0; j < 15; j++) {
                  sum = sum + result1[j].ct;
              }
              if (sum > 0) 
              {
                  if (this_res>0) 
                  {
                      production_factor = production_factor*(sum/this_res);
                  }
                  else
                  {
                      production_factor = production_factor*(sum); // so first island's price wont be too low
                  }
              }
              
                var population_factor  = current_pop*5; // should we change to 3 ??
                island_value = production_factor + population_factor;
                if (big<1) 
                {
                  island_value = island_value + 400;
                }
                island_value =  Math.floor(island_value);

                // console.log("island value : " + island_value);
                i.x_cord = x;
                i.y_cord = y;
                i.res_produced.res_name = resource;
                // i.res_produced.res_quantity = res_qty;
                // i.res_produced.res_value = res_val;
                i.name = island_name;
                // console.log("Name "+i.name);
                i.current_population = current_pop;
                i.max_population = cap;
                i.value = island_value;
                // console.log(i);
                var put;
                if (cap>700) 
                {
                	put = 200;
                }
                else
                {
					       put = 128;
                }
                db.collection("islands").insert(i,function(err,result){
                      var resource_name;
                      db.collection("islands").update({name:island_name},{$push:{res_present:{$each:[{name:"bread",quantity:0,sell:put},{name:"fruits",quantity:0,sell:put},{name:"cheese",quantity:0,sell:put},{name:"wood",quantity:0,sell:put},{name:"stone",quantity:0,sell:put},{name:"wheat",quantity:0,sell:put},{name:"bamboo",quantity:0,sell:put},{name:"ale",quantity:0,sell:put},{name:"cotton",quantity:0,sell:put},{name:"silk",quantity:0,sell:put},{name:"honey",quantity:0,sell:put},{name:"fur",quantity:0,sell:put},{name:"gems",quantity:0,sell:put},{name:"chocolate",quantity:0,sell:put},{name:"spices",quantity:0,sell:put}]}}})
                      setTimeout(function(){
                        db.collection('islands').update({$and:[ {name:island_name},{'res_present.name':resource} ]}, {$set:{'res_present.$.quantity':200,'res_present.$.sell':-200}},function(err,result){
                          // console.log("array updation done\n\n");
                          res.send(JSON.stringify({"name":island_name}));
                          db.close();
                        });
                      },150);
    
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
      var exists = 0;

      MongoClient.connect(url, function(err, db) {
        db.collection('players').find( { $and:[ {name:uname},{explored_islands_name:{$elemMatch:{island_name:is_name}}} ] }).count(function(err,result){
          // console.log("-------------------------result="+result);
          // console.log("-------------------------exists="+exists);

          if(result>0){
            exists = 1;
          } 
          db.close();
        }); 
      });

      if(reply == 'true'){
        MongoClient.connect(url, function(err, db) {
              
              db.collection("islands").find({name:is_name}).toArray(function(err, result) {
              	for (var i = 0; i < 15; i++)
              	{
              		var t_res_name = result[0].res_present[i].name;
              		db.collection("islands").update({name:is_name,'res_present.name':t_res_name},{$set:{'res_present.$.sell':0}});
              	}
                  // console.log("result[0].res_present "+result[0].res_present);
                  var island_cost = result[0].value;
                  // var res_produced = result[0].res_produced.res_name;
                  // var max_pop = result[0].max_population;
                  // if (max_pop>700) 
                  // {
                  // 	var res_cap = 3000;
                  // }
                  // else
                  // {
                  // 	var res_cap = 2000;
                  // }
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
                        
                         db.collection("players").update({name:uname},{$inc:{island_wealth:island_cost,total_wealth:island_cost,empty_ship_slots:1}}, function(err, r) {
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

                          db.collection('players').find( { $and:[ {name:uname},{explored_islands_name:{$elemMatch:{island_name:is_name}}} ] }).count(function(err,result){
                            // console.log("-------------------------result="+result);
                            // console.log("-------------------------exists="+exists);

                            if(result>0){
                              exists = 1;

                              db.collection('players').update({name:uname}, {$pull:{explored_islands_name:{island_name:is_name}} }, function(err,rlt){
                                // console.log("-------------------------exp island pulled");
                              });
                            } 
                          });                           
                          
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

                         db.collection('players').find( { $and:[ {name:uname},{explored_islands_name:{$elemMatch:{island_name:is_name}}} ] }).count(function(err,result){
                            // console.log("-------------------------result="+result);
                  
                            if(result==0){
                              explored();
                              return res.send({"message":"poor"});
                              db.close();
                            }
                    
                            else{
                              return res.send({"message":"failure"});
                              db.close();
                            }
                  
                          });
                      }
                  });
              });
        });
      }

      else{
        // console.log("INSIDE NOT BUYED");

        MongoClient.connect(url, function(err, db) {

        db.collection('players').find( { $and:[ {name:uname},{explored_islands_name:{$elemMatch:{island_name:is_name}}} ] }).count(function(err,result){
          // console.log("-------------------------result="+result);

          if(result==0){
            explored();
            return res.send({"message":"success"});
            db.close();
          }
          else{
            return res.send({"message":"failure"});
            db.close();
          }

        });
        
      });
        
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
/////////////////////////////////////////////     ASSIGN SHIP       /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function assign_ship(uname, is_name, model){

  var s = new ship();
  s.owner_name = uname;
  s.source = is_name;
  s.eta = 0;

  if (model=='S')
  {
    s.capacity = 800;
    s.speed = 3;
    s.class = 'S';
  }
  else if (model=='A')
  {
    s.capacity = 500;
    s.speed = 2;
    s.class = 'A';
  }
  else if (model=='B')
  {
    s.capacity = 250;
    s.speed = 2;
    s.class = 'B';
  }
  else if (model=='C')
  {
    s.capacity = 500;
    s.speed = 1;
    s.class = 'C';
  }
  else 
  {
    s.capacity = 200;
    s.speed = 1;
    s.class = 'D';
  }

  MongoClient.connect(url, function(err, db) {
    db.collection("ships").insert(s,function(err,result){
      var id = result.insertedIds[0];
      io.emit("set_ship_id",id);
      db.collection("ships").update({_id:id},{$push:{res_present:{$each:[{name:"bread",quantity:0},{name:"fruits",quantity:0},{name:"cheese",quantity:0},{name:"wood",quantity:0},{name:"stone",quantity:0},{name:"wheat",quantity:0},{name:"bamboo",quantity:0},{name:"ale",quantity:0},{name:"cotton",quantity:0},{name:"silk",quantity:0},{name:"honey",quantity:0},{name:"fur",quantity:0},{name:"gems",quantity:0},{name:"chocolate",quantity:0},{name:"spices",quantity:0}]}}})
      setTimeout(function(){
	      db.collection("players").update({name:uname},{$push:{owned_ships_id:{id:id}},$inc:{empty_ship_slots:-1}}, function(err, r) {
	        assert.equal(null, err);
	        db.close(); 
	      });
      },150);
    });
  });

}

app.post('/buy_ship',function(req,res){
  var uname = req.body.user;
  var is_name = req.body.island;
  var model = req.body.model;
  // console.log("model "+ model);
  MongoClient.connect(url, function(err, db) {
        db.collection("players").find({name:uname}).toArray(function(err,result){
            
            var ship_buying_cost;

            if (model=='S') 
              ship_buying_cost = 5000;
            else if (model=='A')
              ship_buying_cost = 3000;
            else if (model=='B')
              ship_buying_cost = 1500;
            else if (model=='C')
              ship_buying_cost = 1500;
            else 
              ship_buying_cost = 800;

            if (result[0].gold >= ship_buying_cost ) 
            {
              db.collection("players").update({name:uname},{$inc:{gold:-ship_buying_cost}},function(){
                db.close();
                res.send({"message":"success"});
              });
              assign_ship(uname, is_name, model);
            }
            else
            {
              db.close();
              res.send({"message":"failure"});
            }

        });
  });
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////     PLAYER       //////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function insert_player(p,b){
  // console.log("new player");
  MongoClient.connect(url, function(err, db) {
        db.collection("players").insert(p);
        db.collection("bonuses").insert(b);
        db.close();
  });
}

app.post('/player_name', function(req, res) {

  var p = new player();
  var b = new bonus();
  // console.log("\n\nIN PLAYER NAME\n");
  p.name = req.body.username;
  p.sponsors_clicked = [
    {name:"casio",clicked : 0},
    {name:"festpav",clicked : 0},
    {name:"frapp",clicked : 0},
    {name:"imperial",clicked : 0},
    {name:"jamboree",clicked : 0},
    {name:"lenskart",clicked : 0},
    {name:"metro",clicked : 0},
    {name:"spykar",clicked : 0},
    {name:"starbucks",clicked : 0},
  ]
  b.player_name = p.name;

  b.wacky_keyboard = [
    {level1 : 0},
    {level2 : 0},
    {level3 : 0}
  ]
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
    
    db.collection('players').find( { name:p.name } ).count(function(err,results){
      count = results;
      if (count>0) 
      {
        // console.log("old player");
      }
      else
      { 
        insert_player(p,b);

      }

      db.close();
      return res.send("Done");
  });

  });

  
});

app.post('/check_player', function(req, res) {

  var p = new player();
  
  p.name = req.body.username;
  // console.log("checking player" + p.name);
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
    
  //   db.collection('players').find( { name:p.name } ).count(function(err,results){
  //     count = results;
  //     db.close();
  //     console.log("count: "+count);
  //     if (count>0) 
  //     {
  //         res.send(JSON.stringify({"player":"old"}));
  //     }
  //     else
  //     { 
  //       res.send(JSON.stringify({"player":"new"}));
  //     }

  // });
   db.collection('players').find( { name:p.name } ).toArray(function(err,results){
      if(results.length>0){
        if (results[0].owned_islands_name.length>0) 
        {
            res.send(JSON.stringify({"player":"old"}));
        }
        else
        { 
          res.send(JSON.stringify({"player":"new"}));
        }
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

  var user = req.body.user;

  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);

    db.collection('islands').aggregate([{$match:{ owner_name:{$ne:user} }}, {$sample:{size:1}} ], function(err,result){


      if (result.length!=0) 
      {
      	if(result[0].owner_name != 'AI'){
	        var event = user+" visited your island "+result[0].name;
	        db.collection('log').insert({tick:current_tick,name:result[0].owner_name, event:event},function(err,res){
	      	    // console.log("user landing updated");
          });
          
          db.collection("players").update({name:user},{$inc:{gold:-Math.floor(result[0].value/100)}},function(err,res){
            // console.log("visitor gold reduced:"+result[0].value/100);
            var event1 = "You paid "+Math.floor(result[0].value/100)+" for visiting "+result[0].name;

            db.collection('log').insert({tick:current_tick,name:user, event:event1},function(err,res){
	      	     console.log("gold log updated");
            });

          });

          db.collection("players").update({name:result[0].owner_name},{$inc:{gold:Math.floor(result[0].value/100)}},function(err,res){
            // console.log("owner gold increased:"+result[0].value/100);
          });
          db.close();
	    }
      }

      return res.send(result);

    });

  });
  
});




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////     MISCELLANEOUS       ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/get_dice_status',function(req,res){
  var user = req.body.username;
  // console.log("in get dice status "+ user);
  MongoClient.connect(url, function(err, db) {
    db.collection("players").find({name:user}).toArray(function(err, result) {
        // console.log(result[0]);
        db.close();
        return res.send(result);
    });
  });
});

app.post('/update_dice_status',function(req,res){
  var user = req.body.username;
  // console.log("update_dice_status "+ user);
    MongoClient.connect(url, function(err, db) {
      db.collection("players").update({name:user},{$set:{random_event_used:1}},function(err, result) {
        return res.send("Done");
        // setTimeout(function(){
          db.close();
        // },500)
    });
  });
});

app.post('/get_island',function(req,res){

  var user = req.body.user;

  // console.log(user);

  MongoClient.connect(url, function(err, db) {

    db.collection("players").find({name:user}).toArray(function(err, result) {
        db.close();
        return res.send(result);
    });

  });
});

app.post('/get_ship',function(req,res){

  var user = req.body.user;

  MongoClient.connect(url, function(err, db) {

    db.collection("ships").find({owner_name:user}).toArray(function(err, result) {
        db.close();
        return res.send(result);
    });

  });
});


app.post('/get_ship_slots',function(req,res){

  var user = req.body.user1;
  MongoClient.connect(url, function(err, db) {
    db.collection("players").find({name:user}).toArray(function(err, result) {
        db.close();
        return res.send(result);
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
        db.close();
        return res.send(result);
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
        db.close();
        return res.send("Done");
    });

  });
});

app.post('/get_island_info',function(req,res){

  var island = req.body.island;
  var prices = [];
  var base_cost;
  var sum = 0;
  var ct_arr = [];
  // console.log("island: "+ island)
  MongoClient.connect(url, function(err, db) {
  	db.collection("res").find({}).toArray(function(err, result1) {

	      for (var j =0; j < 15; j++) {
	          ct_arr[j] = result1[j].ct;
	          sum = sum + result1[j].ct;
	      }

	      db.collection("islands").find({name:island}).toArray(function(err, result) {
		        // console.log("get_island_info: "+result);
		        db.close();
		        if (result[0].max_population >700) 
		        {
		        	res_cap = 3000;
		        }
		        else
		        {
		        	res_cap = 2000;
		        }
		        for (var j = 0; j < 15; j++) {
		        	if (j < 9) 
		        	{
		        		base_cost = common[j].base_cost;
		        	}
		        	else
		        	{
		        		base_cost = rare[j-9].base_cost;
		        	}
		        	prices[j] = base_cost * sum;
		        	if (ct_arr[j]>0) 
		        	{
		        		prices[j] = prices[j]/ct_arr[j]; 
		        	}
		        	if (result[0].res_present[j].quantity > 0) 
		        	{
		        		prices[j] = prices[j]*(1-(result[0].res_present[j].quantity/res_cap));
		        	}
		        	prices[j] = prices[j]/20;
		        	prices[j] = Math.floor(prices[j])+1;
			    }
			    // for (var j =0; j < 15; j++) {
			    // 	console.log(prices[j] + " ");
			    // }
		        var object = {
		        	result: result,
		        	prices: prices
		        }
		        return res.send(object);
		    });
	  });	
    

  });
});



app.post('/check_feasible',function(req,response){
  var sender = req.body.user;
  var dest = req.body.dest;
  var src = req.body.src;
  var cb = req.body.cb;
  var cs = req.body.cs;
  var oc = req.body.oc;
  var possible_at_source = 1;
  var possible_at_dest = 1;
  var receiver;

  console.log("inside check_feasible");
  MongoClient.connect(url, function(err, db) {
  	console.log("check_feasible");
      db.collection('islands').find({name:src}).toArray(function(req,src_result){
      	if (src_result[0].owner_name!=sender) 
      	{
      		// check if sender has gold >= buying
      		db.collection('players').find({name:sender}).toArray(function(req,sender){
      			if (sender[0].gold < cb+oc) 
    				{
    					possible_at_source=0;
    				} 
      		});
      		
      	}
        else
        {
            db.collection('players').find({name:sender}).toArray(function(req,sender){
              if (sender[0].gold < oc) 
              {
                possible_at_source=0;
              } 
            });
        }
      	db.collection('islands').find({name:dest}).toArray(function(req,dest_result){
      		if (dest_result[0].owner_name!=sender) 
      		{
      			receiver = dest_result[0].owner_name;
      			if (dest_result[0].owner_name!='AI') 
      			{
	      			db.collection('players').find({name:receiver}).toArray(function(req,receiver){
	      			if (receiver[0].gold < cs) 
		  				{
		  					possible_at_dest=0;
                return response.send({message:"status5"});
		  				} 
		      		});
      			}
      		}


	      	if (possible_at_source==1) 
	      	{
	      		if (possible_at_dest==1) 
		      	{
		      		if (src_result[0].owner_name!=sender) 
	      			{
	      				// reduce buying from sender
	      				console.log(" reduce buying from sender ");
	      				cb = Number(cb*(-1));
	      				db.collection('players').update({name:sender},{$inc:{gold:cb}});
	      			}
		      		if (src_result[0].owner_name!=sender&&src_result[0].owner_name!=sender!='AI') 
			      	{
			      		// pay buying to the other player
			      		console.log(" in pay buying to the other player ");
			      		if (receiver!="AI") 
	      				{
	      					cb = Number(cb);
			      			db.collection('players').update({name:receiver},{$inc:{gold:cb}});
			      		}
			      	}
			      	if (dest_result[0].owner_name!=sender) 
	      			{
	      				//give selling to sender
	      				console.log(" in give selling to sender ");
	      				cs = Number(cs);
	      				db.collection('players').update({name:sender},{$inc:{gold:cs}});
	      				//reduce selling from receiver
	      				if (receiver!="AI") 
	      				{
	      					cs = Number(cs*(-1));
		      				db.collection('players').update({name:receiver},{$inc:{gold:cs}});
	      				}
	      			}
                // console.log("returning status0");
                // setTimeout(function(){
                return response.send({message:"status0"});
                // },1000)

            }
            else
            {
              // console.log("returning status1");
              // return res.send("Destination doesnt have enough gold to pay you. You decided not to send goods");
              return response.send({message:"status1"});
            }
          }
          else
          {
            // console.log("returning status2");
	      		// return res.send("Your dont have enough gold to buy these goods!!");
	      		return response.send({message:"status2"});
	      	}
      	});
        //    	setTimeout(function(){
  			// db.close();
        //      },1000)
        // how to close this ?
      });


  });

});


app.post('/send_ship',function(req,res){
  console.log("in send ship")
  var sender = req.body.user;
  var ship = req.body.ship;
  var names = req.body.names;
  var qtys = req.body.qtys;
  var dest = req.body.dest;
  var src = req.body.src;
  var eta;
  var receiver;

  var doc = [];
  console.log("sender: "+sender);
  console.log("ship: "+ship);
  console.log("names: "+names);
  console.log("qtys: "+qtys);
  console.log("dest: "+dest);
  console.log("src: "+src);

  var name = JSON.parse(names);
  var qty = JSON.parse(qtys);

  console.log(name);
  console.log(qty);
  
    for(i=0;i<names.length;i++){

      var num = Number(qty[i]);

        if(qtys[i]!=0)
        {
          var obj = {name: name[i], quantity:num};
          doc.push(obj);
        }
        //console.log(doc)
    }

  // console.log(doc);

  var ObjectId = new mongoose.Types.ObjectId(ship);

  MongoClient.connect(url, function(err, db) {
  	for (item in doc) {
  		var temp_name = doc[item].name;
        var temp_qty = doc[item].quantity;
  		db.collection('islands').update({$and:[ {name:dest},{'res_present.name':temp_name} ]}, {$inc:{'res_present.$.sell':-temp_qty}},function(err,result){
              console.log("reduce res sell from dest");
          });
  	}


    //calculate eta
    db.collection('islands').find({name:src}).toArray(function(err,result){
        var x1 = result[0].x_cord;
        var y1 = result[0].y_cord;
        db.collection('islands').find({name:dest}).toArray(function(err,result){
            var x2 = result[0].x_cord;
            var y2 = result[0].y_cord;
            var xt= x2-x1;
            var yt= y2-y1;
            receiver = result[0].owner_name;
            eta = Math.sqrt(xt*xt+yt*yt);
            eta = Math.ceil(eta/200);
            //console.log("eta "+eta);

            db.collection('ships').find({_id:ObjectId}).toArray(function(err,result){
                eta = Math.floor(eta/result[0].speed)+1;
                if (eta>9) 
                {
                  eta = 9;
                }
                db.collection('ships').update({_id:ObjectId},{$set:{eta:eta,destination:dest}});
                var operating_cost = eta*15;
                var owner_name = result[0].owner_name;
                db.collection('players').update({name:owner_name},{$inc:{gold:-operating_cost}});

                if(receiver != 'AI'){
                  var event = "Ship from "+dest+" to "+src+" (ETA: "+eta+")"; 
                  db.collection("log").insert({tick:current_tick, name:receiver, event:event},function(err,res){
                    console.log("Ship log updated");
                  });
                }
            });
        });

        //loading on ship
        for (item in doc) {
          var temp_name = doc[item].name;
          var temp_qty = doc[item].quantity;
          // console.log("temp_qty "+temp_qty );
          db.collection('ships').update({_id:ObjectId,"res_present.name":temp_name},{$inc:{'res_present.$.quantity':temp_qty}})
          db.collection('islands').update({$and:[ {name:src},{'res_present.name':temp_name} ]}, {$inc:{'res_present.$.quantity':-temp_qty}},function(){
              console.log("ship loading")
          });
        }
    });
    // how to close this ?

    return res.send("Done");

  });
});


app.post('/set_sell',function(req,res){

  var id = req.body.id;
  var qty = req.body.qty;
  var island = req.body.island;
  var choice = req.body.choice;
  if (id > 14) 
  {
  	id = id - 15;
  }
  // console.log(id);
  // console.log(qty);
  // console.log(island);
  // console.log(choice); // 0 buy ,1 sell
  if (choice==1) 
  {
    qty = qty*(-1);
  }
  qty = Number(qty);
  // quantity positive if buying or accepting. (goods comming on island)
  // quantity negative if selling (goods going out of island)
  if (id>8) 
  {
    var res_name = rare[id].name;
  }
  else
  {
    var res_name = common[id].name;
  }
  MongoClient.connect(url, function(err, db) {
      // update sell
        	// console.log("qty "+qty);

      db.collection('islands').update({$and:[ {name:island},{'res_present.name':res_name} ]}, {$set:{'res_present.$.sell':qty}},function(){
        db.close();
        return res.send("Done");
      });


  });
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////     TICK CHANGED       ////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
  

  var dur = 10; // 10 mins i.e. 6 ticks per hour
  var duration = dur* 60; 
  var adjust;
  function myFunction() {
  var sum = m*60+h*3600+n*86400; // in secs
    d = new Date();
    n = d.getUTCDate();
    n1 = 6;                      //IMPORTANT : LATER MAKE N1 THE STARTING DATE OF MEGA EVENT
      adjust = n1*24*(60/dur)-33;

      h = addZero(d.getUTCHours(), 2);
      m = addZero(d.getUTCMinutes(), 2);  
      s = addZero(d.getUTCSeconds(), 2);

      sec = addZero(60 - s, 2);
      min = 60 - m -1 ;
      t = parseInt(min/dur);
      min = min - (t*dur);
      temp = sum / duration;
      current_tick = parseInt(temp) - adjust ;
      // console.log("timer: "+min + ":" + sec);
      // console.log("current_tick "+ current_tick);
      console.log("m: "+m)
      console.log("min: "+min)
      console.log("s: "+s)
      console.log("sec: "+sec)
      if (min=='0' && sec == "02") 
      {
          console.log("\nSERVER SIDE TICK CHANGED\n");
          // console.log(clients);
          newTick();
          // console.log("resetting dice status");
          io.emit('reset_dice_status',true);
      }
      
  }


function newTick(){
// CAN COMBINE SOME FEATURES HERE


MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);

  var ct_arr = [];
  var sum=0;
  var inc_pop=0;
  var types = 0;
  var total_res_present =0;
  var consume;
  var present;
  var produced = 0;
  var res_cap;

  db.collection("res").find({}).toArray(function(err, result1) {
          for (var j =0; j < 15; j++) {
              ct_arr[j] = result1[j].ct;
              sum = sum + result1[j].ct;
          }
      });	


  db.collection("players").find().forEach(function(data){
      var name = data.name;
      if (current_tick%36==0) 
      { 
        for (var i = 0; i <9; i++) {
          db.collection('players').update({name:name,'sponsors_clicked.name':sponsors[i]},{$set:{'sponsors_clicked.$.clicked':0}})
        }
      }

      db.collection("players").update({name:name},{$set:{random_event_used:0}})

      db.collection("islands").aggregate([{$match:{owner_name:name}},{$group:{_id:null,total:{$sum:"$value"},total_pop:{$sum:"$current_population"}}}]).toArray(function(err,res){
      	// console.log("name "+name);
      	// console.log("res[0].total "+res[0].total);
      	// console.log("res[0].total_pop "+res[0].total_pop);
      	if (res.length!=0) 
      	{
      		var is_wealth_total = res[0].total;
	      	var inc_gold = Math.floor(res[0].total_pop/25);
	      	db.collection("players").update({name:name},{$set:{island_wealth:is_wealth_total}});
	      	db.collection("players").update({name:name},{$inc:{gold:inc_gold}});
      	}	
      })
      var no_of_explored = data.explored_islands_name.length;
      // console.log("no_of_explored: "+ no_of_explored)
      var total_wealth = Math.floor(data.island_wealth + (data.gold/5))+no_of_explored*50;
      db.collection("players").update({name:name},{$set:{total_wealth:total_wealth}});
      db.collection("players").update({name:name},{$set:{random_event_used:0}}); // resetting random event

    });


    db.collection("ships").find().forEach(function(data){

      if (data.eta>1) // if eta == 1 ship lands end of this tick
      {
        db.collection("ships").update({_id:data._id},{$inc:{eta:-1}})
      }
      else if (data.eta==1) // ship lands
      {
        db.collection("ships").update({_id:data._id},{$inc:{eta:-1}}) // eta becomes 0 in db indicating ship is at halt.
         var total_on_ship = 0;
         var present = 0;
         for (k in data.res_present) {
         	if (data.res_present[k].quantity > 0) 
         	{
				total_on_ship = total_on_ship + data.res_present[k].quantity;
         		present++;
         	}
         }

         var space_on_island = 0;
         var res_cap=0;
         var sum = 0;
         var diff = 0;
         db.collection("islands").find({name:data.destination}).toArray(function(err, result1) {
              if(result1[0].max_population > 700)
              {
              		res_cap = 3000;
              }
              else
              {
              		res_cap = 2000;
              }
              for (var i = 0; i < 15; i++) 
              {
              		sum = sum + result1[0].res_present[i].quantity;
              		if (result1[0].res_present[i].sell > 0) 
              		{
              			sum = sum + result1[0].res_present[i].sell;
              		}
              }
              space_on_island = res_cap - sum;
              if (space_on_island < total_on_ship) 
              {
              	diff = total_on_ship - space_on_island;
              	diff = Math.floor(diff/present);
              }
              for (k in data.res_present) {
	          if (data.res_present[k].quantity>0) {
	            // db.collection('islands').find({name:data.destination}).toArray(function(res,result){
	                // result[0].accepting[k].quantity
	                db.collection('islands').update({ //put on dest island
	                  $and:[ {name:data.destination},{'res_present.name':data.res_present[k].name} ]},
	                  {$inc:{'res_present.$.quantity':data.res_present[k].quantity-diff}
	                });
	            // })
	            
	            db.collection('ships').update({ // unload from ship
	              _id:data._id,"res_present.name":data.res_present[k].name},
	              {$inc:{'res_present.$.quantity':-data.res_present[k].quantity}
	            });
	          }
	        }


      	});

        db.collection('ships').update({_id:data._id},{$set:{source:data.destination,destination:null}})

      }

    });

    db.collection("islands").find().forEach(function(data){
        // console.log("island_name:" + data.name);
        // console.log("current_population:" + data.current_population);
      //	console.log(data);
      	if(data.max_population > 700)
      	{
      		res_cap = 3000;
      	}
      	else
      	{
      		res_cap = 2000;
      	}
        // console.log(data.owner_name);
      	// update sell values
        if (data.owner_name=='AI') 
        {
        	for (var i7 = 0; i7 < 15; i7++) {
            // console.log(data.res_present);
        		if (data.res_present[i7].quantity > 0) // if res present increases, then increase sell magnitude
        		{
        			var temp_qt = data.res_present[i7].quantity;
        			temp_qt = Number(temp_qt*(-1));
        			db.collection("islands").update({name:data.name,"res_present.name":data.res_present[i7].name},{$set:{"res_present.$.sell":temp_qt}});
        		}
        	}
        }
        // consumption and updation of res
        consume = Math.floor(data.current_population / 25); // 25 ppl consume 1 unit of each res
        var availale_space;
        var occupied = 0;
        for (var i8 = 0; i8 < 15; i8++) {
        	occupied = occupied + data.res_present[i8].quantity;
        	if (data.res_present[i8].sell > 0) 
        	{
        		occupied = occupied + data.res_present[i8].sell;
        	}
        }

        for (var i2 = 0; i2 < 15; i2++) {
            produced = 0;
            var put = 0;
            present = data.res_present[i2].quantity;
            // console.log("checking "+data.res_produced.res_name);
            // console.log("checking "+data.res_present[i2].name);
            if (data.res_produced.res_name==data.res_present[i2].name) 
            {
              produced = Math.floor(data.current_population / 10);
              // console.log("produced: "+produced);
              // present = present + produced;
            }
            if (present > consume) 
            {
            	if (res_cap > occupied) 
            	{
            		put = produced - consume;
	                if (put > res_cap - occupied) 
	                {
	                	put = res_cap  - occupied;
	                }
            	}
            	else
            	{
            		put = res_cap - occupied;
            	}
                
                // if (present+produced>res_cap) 
                // {
                //   // console.log("in"); // instead of res cap, availale space;
                //   put = res_cap - present;
                // }
                put = Number(put);
                // console.log("put "+put);
                db.collection("islands").update({name:data.name,"res_present.name":data.res_present[i2].name},{$inc:{"res_present.$.quantity":put}});
            }
            else
            {
                if (produced > 0) 
                {
                  put = produced - consume
                }
                else
                {
                  put = -present;
                }
                put = Number(put);
                // console.log("put here "+put);
                db.collection("islands").update(
                {name:data.name,"res_present.name":data.res_present[i2].name},
                {$inc:{"res_present.$.quantity":put}});
            }
        }

        for (var i1 = 0; i1 < 15; i1++) {
          total_res_present = total_res_present + data.res_present[i1].quantity;
          if (i1<9) 
          {
            if (data.res_present[i1].quantity > 0) {
                types++;
                inc_pop = inc_pop + Math.floor(data.res_present[i1].quantity/100);
            }
          }
          else
          {
            if (data.res_present[i1].quantity > 0) {
                types++;
                inc_pop = inc_pop + Math.floor(data.res_present[i1].quantity/50);
            }
          }
        }
        inc_pop = inc_pop*types;
        var max_pop = data.max_population;

        if ((data.current_population+inc_pop)>max_pop) // doesnt let pop overflow
        {
          inc_pop = max_pop - data.current_population;
        }
        if (total_res_present<data.current_population) // reduce population if not enough res on island
        {
          if (data.current_population<200) // dont reduce below a certain limit
          {
            inc_pop = 0;
          }
          else
          {
            inc_pop = -Math.floor(data.current_population/20);
          }
        }
        // console.log("inc_pop "+inc_pop);
        db.collection("islands").update({name:data.name},{$inc:{current_population:inc_pop}});

        // sell value updation 
  		if (data.max_population>700) 
        {
          res_cap = 3000;
        }
        else
        {
          res_cap = 2000;
        }
        var temp_qt;
        var temp_name;
        var sum_res=0;
        var count_exceed = 0;
        for (var i5 = 0; i5 < 15; i5++) {
        	temp_qt = data.res_present[i5].quantity;
        	temp_name = data.res_present[i5].name;
        	if (data.res_present[i5].sell < 0) // player has set for selling
        	{
        		if(temp_qt < (data.res_present[i5].sell)*(-1)) // pres less than selling. make sell = pres
        		{
        			temp_qt = Number(temp_qt*(-1));
        			// console.log("temp_qt "+temp_qt);

        			db.collection("islands").update({name:data.name,'res_present.name':temp_name},{$set:{"res_present.$.sell":temp_qt}})
        		}
        		sum_res = sum_res + data.res_present[i5].quantity;
        	}
        	else if (data.res_present[i5].sell > 0) // player has set for accepting
        	{
        		count_exceed++;
        		sum_res = sum_res + data.res_present[i5].quantity + data.res_present[i5].sell;
        	}
        	else
        	{
        		sum_res = sum_res + data.res_present[i5].quantity;
        	}
        }
        var reduce=0;
    	// console.log("sum_res "+sum_res);
    	// console.log("res_cap "+res_cap);

        // if (sum_res > res_cap) 
        // {
        	var diff = sum_res - res_cap;
        	if (diff > 0) 
        	{
        		if (data.owner_name=='AI') 
		        {
	        		if (count_exceed>0) 
	        		{
		        		reduce = Math.floor((diff/count_exceed)) + 1;
			        	reduce = Number(reduce * (-1));
			        	// console.log("reduce "+reduce);
		        	}
		        }
        	}
        	else  // diff negative. meaning, increase accepting since space present.
        	{
        		if (data.owner_name=='AI') 
		        {
		        	if (count_exceed>0) 
	        		{
	        			diff = Number(diff*(-1));
		        		reduce = Math.floor((diff/count_exceed)) + 1;
			        	// reduce = Number(reduce * (-1));
			        	// console.log("reduce "+reduce);
		        	}
		        }
        	}
        	
        // }
        for (var i6 = 0; i6 < 15; i6++) {
			// console.log("reduce "+reduce);
			if (reduce <= 0) // decrease accepting
			{
				if (data.res_present[i6].sell > 0) 
				{
	        		db.collection("islands").update({name:data.name,'res_present.name':data.res_present[i6].name},{$inc:{"res_present.$.sell":reduce}})
				}
			}
			else if (reduce > 0)  // increase accepting
			{
				if (data.res_present[i6].sell < 100) 
				{
	        		db.collection("islands").update({name:data.name,'res_present.name':data.res_present[i6].name},{$inc:{"res_present.$.sell":reduce}})
				}
			}

			
        }


        // updating island wealth based on res present and pop
        // console.log("ct_arr "+ct_arr);
        var value;
        value = (data.current_population)*3;
        var res_pres_factor=0;
        var multiply=0;
        for (var i3 = 0; i3 < 15; i3++) {
            if (sum>0) 
            {
              if (ct_arr[i3]>=0) 
              {
              	if (data.res_present[i3].quantity>0) 
              	{
              		multiply++;
              	}
                if (ct_arr[i3]!=0) 
                {
                  res_pres_factor =  res_pres_factor + Math.floor((data.res_present[i3].quantity/10)*(sum/ct_arr[i3]));
                }
                else
                {
                  res_pres_factor =  res_pres_factor + Math.floor((data.res_present[i3].quantity/10)*(sum));
                }
              }
            }
        }
        res_pres_factor = res_pres_factor*multiply;
        value = Math.floor(value + res_pres_factor);
        db.collection("islands").update({name:data.name},{$set:{value:value}},function(){
          setTimeout(function(){
              db.close();
            },500)
        })

    });

  });

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////     LOGS      /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/get_log',function(req,res){

  var user = req.body.user;

  MongoClient.connect(url, function(err, db) {
    
    db.collection('log').find({name:user}).sort({tick:1}).toArray(function(err, results){
      return res.send(results)
    });
  });
});

app.post('/delete_log',function(req,res){

  var id_list = req.body.id;

  console.log(id);

  var id = JSON.parse(id_list);

  MongoClient.connect(url, function(err, db) {
    
    for(var i in id){

      console.log("id="+id[i]);

      var ObjectId = new mongoose.Types.ObjectId(id[i]);

      db.collection('log').remove({_id:ObjectId},function(err, results){
        console.log("log deleted");
      });
    }

    return res.send("done");
    db.close();
  });
});

app.post('/toggle_tut',function(req,res){

  console.log("inside toggle tut");

  var name = req.body.name;

  console.log("toggle name="+name);

  MongoClient.connect(url, function(err, db) {

    var current;

    db.collection("players").find({name:name}).toArray(function(err,result){
      console.log(result);
      current = result[0].tut;
      console.log("current="+current);
      current = 1 - current;
      console.log("change current:"+current);
      db.collection("players").update({name:name},{$set:{tut:current}},function(err,result){
        console.log("change current:"+current);
        if(current==1)
        {
          return res.send({status:"enabled"});
        }
        else
        {
          return res.send({status:"disabled"});
        }
        db.close();
      })
    });
  });
  

});

app.post('/tut_status',function(req,res){

  console.log("inside tut status");

  var name = req.body.name;

  console.log("toggle name="+name);

  MongoClient.connect(url, function(err, db) {

    var current;

    db.collection("players").find({name:name}).toArray(function(err,result){
      console.log(result);
      current = result[0].tut;
      console.log("current="+current);
  
        if(current==1)
        {
          return res.send({status:"enabled"});
        }
        else
        {
          return res.send({status:"disabled"});
        }
        db.close();
    });
  });
  

});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////     SPONSORS      /////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.post('/sponsor_click',function(req,res){

  var user = req.body.user;
  var id = req.body.id;
  console.log("user: "+user)
  console.log("id: "+id)

  MongoClient.connect(url, function(err, db) {
    db.collection('players').find({name:user}).toArray(function(err, results){
      if (results.length > 0) 
      {
        for (var i = 0; i < 9; i++) {
          console.log("sponsors:"+results[0].sponsors_clicked[i].name);
          console.log("sponsors:"+results[0].sponsors_clicked[i].clicked);
        }
        if (results[0].sponsors_clicked[id].clicked==0) 
        {
          db.collection('players').update({name:user},{$inc:{gold:250}})
          db.collection('players').update({name:user,'sponsors_clicked.name':sponsors[id]},{$set:{'sponsors_clicked.$.clicked':1}})
        }
      }
      return res.send(results)
    });
  });
});