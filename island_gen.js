var user;

	$(document).ready(function(){

        user = localStorage.getItem("user");

        function assign_island(x){
            $.ajax({
                type: 'POST',
                url: '/create_island',
                data: {username:user},
                dataType: 'json'}).
                done(function(resp){

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

                    $.ajax({
                        type: 'POST',
                        url: '/assign_island',
                        data: {username:user, island:resp.name, reply:reply, old:x},
                        success: function(data){
                            console.log("Assign island successfull");
                            window.island_menu.location.reload();
                        }
                    });

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