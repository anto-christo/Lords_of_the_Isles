
var islands = ["Greenland","New Guinea","Borneo","Madagascar","Baffin Island","Sumatra","Honshu","Victoria Island","Great Britain","Ellesmere Island","Sulawesi","South Island","Java","North Island","Luzon","Newfoundland","Cuba","Iceland"];

var resources = ["copper","iron","bronze","wood","oil","coal","uranium","lead","aluminium","diamond","emerald","coconut","salt","rice","wheat"];
	
var user;

	$(document).ready(function(){

        user = player;

        var reply;
        var flag = 0;
        var island_name;
        var x;

        console.log(player);

        function assign(){
            $.ajax({
                type: 'POST',
                url: '/assign_island',
                data: {username:user, island:island_name, reply:reply},
                dataType : 'json',
            
            });
        }

        setInterval(function(){
            console.log("ewger");
            if(flag==1){
                console.log("assign");
                assign();
                flag = 0;
            }
        },500);

        function assign_island(x){
            $.ajax({
                type: 'POST',
                url: '/create_island',
                dataType: 'json',
                success: function(resp){

                    console.log(resp.name);

                    if(x==1){
                        reply = confirm("Do you want to buy "+resp.name+"?");

                        if(reply==true){
                            reply = 'true';
                        }

                        else
                            reply = 'false';
                    }

                    else
                        reply = 'true';

                    flag = 1;

                    island_name = resp.name;

                }
            
            });
        }

        function old_island(){
            $.ajax({
                type: 'POST',
                url: '/old_island',
                data: {username:user},
                dataType : 'json',
                success: function(resp){
                    alert("Owned Island:"+resp[0].name);
                }
            
            });
        }

		$("#dice_btn").click(function(){

            var rand = Math.floor(Math.random()*2);

            console.log("rand="+rand);

            if(rand==0)
                assign_island(1);

            else{
                old_island();
            }
            
        });
        
        function check_player(){
            $.ajax({
                type: 'POST',
                url: '/check_player',
                data: { username:user },
                dataType: 'json',
                success: function(x){
                    if(x.player=="new"){
                        console.log("new player");
                        assign_island(0);
                    }
                }
            });
        }

        check_player();
	});