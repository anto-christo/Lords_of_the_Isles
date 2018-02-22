	$(document).ready(function(){
        var user;
        user = localStorage.getItem("user");
        // console.log("here user: "+user);
        // console.log(localStorage.getItem("user"));
        var random_event = 0;
        var socket = io();
        socket.on('reset_dice_status',function(data){
            random_event = 0;
            // console.log("\nreset done\n");
        })

            // get_dice_status(0);

        function assign_island(x){
            // console.log("INSIDE ASSIGN ISLAND");
            $.ajax({
                type: 'POST',
                url: '/create_island',
                data: {username:user},
//                async: false,
                dataType: 'json'}).
                done(function(resp){

                    localStorage.setItem("i_name", resp.name);

                    // console.log("inside user: "+user);
                    if(x==0){
                        $.ajax({
                            type: 'POST',
                            url: '/assign_island',
  //                          async: false,
                            data: {username:user, island:resp.name, reply:'true', old:x},
                            success: function(data){
                                if (data.message=="success") 
                                {
                                    // console.log("Assign island successfull");
                                    
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
        

        function old_island()
        {
            $.ajax({
                type: 'POST',
                url: '/old_island',
                data: {user:user},
                dataType : 'json',
                // async: false,
                success: function(resp){
                    if (resp.length!=0) 
                    {
                         // console.log(resp[0])
                        localStorage.setItem("i_name", resp[0].name);
                        localStorage.setItem("user_click",0);
                        parent.window.change_iframe_src('islands-info.html');
                    }
                    else
                    {
                        assign_island();
                    }
                }
            
            });
        }

        function oldNew()
        {

            var rand = Math.floor(Math.random()*2);

            // console.log("rand="+rand);

            if(rand==0)
                assign_island(1);

            else{
                old_island();
            }
        }
         $('[data-toggle="popover"]').popover({
                placement : 'bottom',
                trigger : 'hover'
            });
        var text;
        $('[data-toggle="dice"]').popover({
                placement : 'bottom',
                trigger : 'hover',
                html : true,
                content : text
            });

        function get_dice_status(t)
        {
            // console.log("inside get dice status");
            // console.log("random_event: "+random_event);
            user = localStorage.getItem("user");
            // console.log("user: "+ user);
            $.ajax({
                type: 'POST',
                url: 'get_dice_status',
                data: { username:user },
                dataType: 'json',
                // async: false,
                success: function(data){
                    // console.log("data: "+data);
                    random_event = data[0].random_event_used;  
                    if (random_event==0) // not used random event yet
                    {
                        text =  "Click to trigger random event";
                    }
                    else
                    {
                        text =  "Already used random event for this tick";
                    }
                   
                }
            });
            // console.log("t "+ t);
            if (t==1) 
            {
                if (random_event==0) 
                {
                    $.ajax({
                        type: 'POST',
                        url: 'update_dice_status',
                        data: { username:user },
                        dataType: 'json',
                        success: function(data){
                            console.log("here in");
                        }
                    });
                    oldNew();
                    get_dice_status(0);
                    
                }
                else
                {
                    alert("This can be used only once per tick. Try again next tick!");
                }
            }
        }
        $("#dice_btn").click(function(){
            //get_dice_status(1);
            // oldNew();
            get_dice_status(1);

        });

        function check_player(){
            // console.log("in check player function");
            $.ajax({
                type: 'POST',
                url: '/check_player',
                // async: false,
                data: { username:user },
                dataType: 'json',
                success: function(x){
                    // console.log("check player success");
                    // console.log("x.player:" + x.player);
                    if(x.player=="new"){
                        assign_island(0);
                        localStorage.setItem("old",0);
                    }
                    else
                    {
                        localStorage.setItem("old",1);
                        get_dice_status(0);

                    }
                }
            });
        }
        var flag = 0;
        var dice = document.getElementById('dice_btn');
        setInterval(function(){ 
            if (random_event==0) 
            {
                 if (flag == 0) 
                {
                    dice.style.filter = "brightness(1.2)";
                    flag = 1;
                }
                else
                {
                    dice.style.filter = "brightness(0.7)";
                    flag = 0;
                }
            }
            else{
                dice.style.filter = "brightness(0.7)";
            }
           
         }, 900);


       
        check_player();
	});