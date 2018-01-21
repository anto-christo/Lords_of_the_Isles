var islands = ["Greenland","New Guinea","Borneo","Madagascar","Baffin Island","Sumatra","Honshu","Victoria Island","Great Britain","Ellesmere Island","Sulawesi","South Island","Java","North Island","Luzon","Newfoundland","Cuba","Iceland"];

var resources = ["copper","iron","bronze","wood","oil","coal","uranium","lead","aluminium","diamond","emerald","coconut","salt","rice","wheat"];
	
var user;

	$(document).ready(function(){

        user = player;

        console.log(player);

        function assign_island(x){
            $.ajax({
                type: 'POST',
                url: '/create_island',
                dataType: 'json',
                success: function(resp){

                    console.log(resp.name);

                    if(x==1)
                        var reply = confirm("Do you want to buy "+resp.name+"?");

                    else
                        var reply = 1;

                    if(reply){
                        $.ajax({
                            type: 'POST',
                            url: '/assign_island',
                            data: {username:user, island:resp.name},
                            dataType : 'json',
                            success: function(resp){
                            }
                        
                        });
                    }

                }
            
            });
        }

        if(old == 0){
            assign_island(0);
            old = 1;
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
	});