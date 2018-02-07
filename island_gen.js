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
                    localStorage.setItem("i_name", resp.name);

                    if(x==0){
                        
                        $.ajax({
                            type: 'POST',
                            url: '/assign_island',
                            data: {username:user, island:resp.name, reply:'true', old:x},
                            success: function(data){
                                if (data.message=="success") 
                                {
                                    console.log("Assign island successfull");   
                                }
                                else
                                {
                                    alert("Not Enough Gold!!");
                                }
                                // window.island_menu.location.reload(); // not required. gives error when new player joins
                            }
                        });
    
                    }

                    else{
                        localStorage.setItem("i_name", resp.name);
                        localStorage.setItem("user_click",0);
                        parent.window.change_iframe_src('islands-info.html');
                    }

                    

                });
            }
        

        function old_island(){
            $.ajax({
                type: 'POST',
                url: '/old_island',
                data: {user:user},
                dataType : 'json',
                success: function(resp){
                    if (resp[0]) 
                    {
                         console.log(resp[0])
                        localStorage.setItem("i_name", resp[0].name);
                        localStorage.setItem("user_click",0);
                        parent.window.change_iframe_src('islands-info.html');
                    }
                    else
                    {
                        oldNew();
                    }
                   

                }
            
            });
        }

         function oldNew()
                {

                    var rand = Math.floor(Math.random()*2);

                    console.log("rand="+rand);

                    if(rand==0)
                        assign_island(1);

                    else{
                        old_island();
                    }
                }

		$("#dice_btn").click(function(){

            oldNew();

          
            
            
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
                        localStorage.setItem("old",0);
                    }

                    else
                        localStorage.setItem("old",1);
                }
            });
        }

        check_player();
	});