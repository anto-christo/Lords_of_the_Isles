var islands = ["Greenland","New Guinea","Borneo","Madagascar","Baffin Island","Sumatra","Honshu","Victoria Island","Great Britain","Ellesmere Island","Sulawesi","South Island","Java","North Island","Luzon","Newfoundland","Cuba","Iceland"];

var resources = ["copper","iron","bronze","wood","oil","coal","uranium","lead","aluminium","diamond","emerald","coconut","salt","rice","wheat"];
	
var user;

	$(document).ready(function(){

        user = player;

        console.log(player);

        function assign_island(){
            $.ajax({
                type: 'POST',
                url: '/assign_island',
                data: {username:user},
                dataType : 'json',
                success: function(resp){

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
                    
                }
            
            });
        }

        if(old == 0){
            assign_island();
        }

		$("#dice_btn").click(function(){

            $.ajax({
                type: 'POST',
                url: '/assign_island',
                success: function(resp){

                var nos = Number(resp);

                    var rand = Math.floor(Math.random()*nos);

                    if(nos%5 == 0){
                        assign_island();
                    }

                    else{
                        old_island();
                    }
                }
            
            });
		});
	});