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

var global_user;
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

io.on('connection', function(socket) {
    updateLeaderboard();
    socket.emit('getLeaderboard', rankings);
    setInterval(function(){ 
      updateLeaderboard();
      socket.emit('getLeaderboard', rankings);
    }, 10000);


    updateGold();
    socket.emit('getGold', gold);
    setInterval(function(){ 
      updateGold();
      socket.emit('getGold', gold);
    }, 5000);



});

function updateLeaderboard(){
    MongoClient.connect(url, function(err, db) {
       assert.equal(null, err);
                db.collection('players').find().sort({wealth:-1}).limit(5).toArray(function(err, results){
                      var j=0;
                      while(j<5){
                        var obj = {name: results[j].name,wealth: results[j].wealth}
                        rankings[j] = obj;
                        j++;
                      }
                });
                db.close(); 
      });
}

function updateGold(){
    MongoClient.connect(url, function(err, db) {
       assert.equal(null, err);
       // global_user = "newbie"; // uncomment later. when commented, works only if entry is through index.html
       console.log("global_user "+ global_user);
                db.collection('players').find({name:global_user}).toArray(function(err, results){
                     gold = results[0].gold;
                });
                db.close(); 
      });
}

var islands;
var resources = ["copper","iron","bronze","wood","oil","coal","uranium","lead","aluminium","diamond","emerald","coconut","salt","rice","wheat"];
  
// app.post('/init_islands', function(req, res) {

//     var isl = new islands(); 
//     var j,k;
//     for (var i = 0; i <= 10; i++) {
        
//     }

// });

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

// app.post('/set_player', function(req, res) {
//     var name = req.body.username;
//     global_user = name;  

//     fs.readFile('names.txt', function (err, data) {
//       if (err) {
//          return console.error(err);
//       }

//       islands = data.toString().split("\n");

//       for(i=0;i<islands.length;i++)
//       console.log(islands[i]);

//       var rand = Math.floor(Math.random()*islands.length-1);
//       console.log(rand);
//       console.log(islands[rand]);

//       var ind = islands.indexOf(islands[rand]);

//       if(ind != -1){
//         islands.splice(ind,1);
//       }

//       for(i=0;i<islands.length;i++)
//       console.log(islands[i]);

//       var new_list = islands.join("");

//       fs.writeFile('names1.txt',new_list,  function(err) {
//         if (err) {
//            return console.error(err);
//         }
        
//         console.log("Data written successfully!");     
//      });
//    });

// });

app.post('/player_name', function(req, res) {
  
  p.name = req.body.username;
  global_user = p.name;
  console.log(p.name);

  fs.readFile('names.txt', function (err, data) {
    if (err) {
       return console.error(err);
    }

    islands = data.toString().split("\n");

    // for(i=0;i<islands.length;i++)
    // console.log(islands[i]);
 });

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

// app.get('/prev_pos', function(req, res){

//   MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);

//       db.collection("map").find({}).toArray(function(err, result) {
//         assert.equal(null, err);
//         res.send(result);
//         db.close();
//     });
//   });

// });

// app.post('/update_map', function(req, res) {

//   pxpos = req.body.pxpos;
//   xpos = req.body.xpos;
//   pypos = req.body.pypos;
//   ypos = req.body.ypos;

//   console.log(pxpos+","+xpos+","+pypos+","+ypos);

//   MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);

//     db.collection("map").update({xpos:pxpos, ypos:pypos}, {xpos:xpos, ypos:ypos}, function(err, result) {
//       if(err) throw err;

//       res.send(JSON.stringify({'msg':'success'}));
//       db.close();
//     });

//   });
  
//  });

// app.post('/island_info', function(req, res) {

//   var i = new island();

//   i.name = req.body.name;
//   i.resource = req.body.resource;
//   i.cap = req.body.cap;
//   i.xpos = req.body.xpos;
//   i.ypos = req.body.ypos;

//   console.log(i.name);

//   MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);

//     var island_details = {
//       x_cord : i.xpos,
//       y_cord : i.ypos,
//         name : i.name,
//         res_produced : i.resource,
//         max_population : i.cap
//     };

//     db.collection("islands").insert(island_details, function(err, r) {
//       assert.equal(null, err);
//       assert.equal(1, r.insertedCount);
//       res.send(JSON.stringify({'imsg':'success'}));
//     });

//     console.log("user="+global_user);

//     db.collection("players").update({name:global_user},{$push:{explored_islands_name:{island_name:i.name}}}, function(err, r) {
//       assert.equal(null, err);
//       console.log("player updated");
//       db.close(); 
//     });

//   });

// });


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



// app.post('/island_check', function(req, res) {
//   var i = new island();
//   i.name = req.body.name;

//   MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);


//           db.collection('islands').find( { name:i.name } ).count(function(err,results){
//           count = results;
//           if (count>0) 
//           {
//                   res.send(JSON.stringify({'msg':'owned'}));
//           }

//           else
//           { 
//              res.send(JSON.stringify({'msg':'new'}));
//           }
//     });

//   });

// });

