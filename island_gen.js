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

        if(old == 0){
            assign_island();
        }

		// function prev_pos(name,resource,cap){

		// 	$.ajax({
        //      type: 'GET',
        //      url: '/prev_pos',
        //      success: function(resp){

        //      	var x = Number(resp[0].xpos);
        //      	var y = Number(resp[0].ypos);

        //      	console.log('x='+x+"\ny="+y);
             	
        //      	if(x<1000){
		// 			var randx = Math.floor(Math.random()*200)+50;
		// 			console.log(randx);
		// 			var px = x;
		// 			var py = y;
		// 			x+=randx;

		// 			update_map(px,x,py,y,name,resource,cap);
        //      	}

        //      	else{
        //      		var randy = Math.floor(Math.random()*200)+50;
        //      		var py = y;
        //      		var px = x;
        //      		x=10;
        //      		y+=randy;

        //      		update_map(px,x,py,y,name,resource,cap);
        //      	}
        //      }
         
        //     });
		// }

		// function update_map(pxpos,xpos,pypos,ypos,name,resource,cap){
			
		// 	$.ajax({
        //      type: 'POST',
        //      url: '/update_map',
        //      data: {pxpos:pxpos ,xpos:xpos, pypos:pypos, ypos:ypos},
        //      dataType : 'json',
        //      success: function(resp){
        //      	console.log(resp.msg);

        //      	if(resp.msg==="success")
        //      	create_island(xpos,ypos,name,resource,cap);
        //      }
         
        //     });
		// }


		// function check_island(){
        //     var random_name = Math.floor(Math.random()*(islands.length-1));
        //     var name = islands[random_name];

		// 	$.ajax({
        //         type: 'POST',
        //         url: '/island_check',
        //         data: { name:name },
        //         dataType: 'json',
        //  		success: function(resp){

        //  			if(resp.msg==="owned")
        //  				alert("Owned island: "+name);

        //  			else if(resp.msg==="new"){
        //                 var random_res = Math.floor(Math.random()*(resources.length-1));
        //                 var resource = resources[random_res];

        //                 var cap = Math.floor(Math.random()*1000) + 30;

        //                 prev_pos(name,resource,cap);
        //             }
        //         }
    
        //     });
		// }

        // function create_island(xpos,ypos,name,resource,cap){

        //     $.ajax({
        //         type: 'POST',
        //         url: '/island_info',
        //         data: { xpos:xpos, ypos:ypos, name:name, resource:resource, cap:cap },
        //         dataType: 'json',
        //         success: function(resp){

        //             if(resp.msg==="success"){
        //                 alert("New island: "+name+"\nXpos: "+xpos+"\nYpos: "+ypos+"\nInitial Resource: "+resource+"\nPopulation Cap: "+cap);
        //             }
        //         }
    
        //     });
        // }

		$("#dice_btn").click(function(){
            assign_island();
		});
	});