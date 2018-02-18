var user = localStorage.getItem("user");
var ship = localStorage.getItem("s_id");
var produced = null;
var source = null;
var limit = [];
var ship_cap;
// console.log("Ship="+ship);

function rename(){

    var name = $('#ship_name').val();
    // console.log("Name:"+name);

    $.ajax({
        type: 'POST',
        url: '/rename_ship',
        data: {ship:ship, name:name},
        success: function(data){
            // console.log("Rename successfull");
            parent.window.ship_menu.location.reload();
        }
    });
}

function send_ship(){

    var dest = $('#dest_islands option:selected').text();

    if(dest == 'Select Destination')
        alert("Please select a destination");

    else if(source == dest)
        alert("Destination cannot be same as Source !!");

    else{

        var res_qtys = $("input[name='res_input[]']").map(function(){return $(this).val();}).get();

        var res_names = $("input[name='res_input[]']").map(function(){return $(this).attr('id');}).get();
        console.log(res_names);
        var valid = 1;
        var add = 0;
         for (var i = 0; i < res_names.length; i++) 
         {
                if (Number(res_qtys[i])>limit[i]) 
                {
                    valid = 0;
                }
                add = add + Number(res_qtys[i]);
         }
        
        if (valid==1) 
        {
            if (add<=ship_cap) 
            {
                $.ajax({
                    type:'POST',
                    url:'/send_ship',
                    data:{user:user, ship:ship, names:res_names, qtys:res_qtys, src:source,dest:dest},
                    success: function(data){
                        alert("Ship has set sail successfully !!");
                        
                    }
                });
            }
            else
            {
                alert("Cannot load more than ship's capacity!!");
            }
           
        }
        else
        {
            alert("Enter valid no. of goods to export!!");
        }
        location.reload();
    }
}


$(document).ready(function(){
    $.ajax({
        type:'POST',
        url:'/get_ship_info',
        data:{ship:ship},
        success: function(result){
                var eta = result[0].eta;
                ship_cap = result[0].capacity;
                    $.ajax({
                        type:'POST',
                        url:'/get_island',
                        data:{user:user},
                        success: function(result){

                            for(i=0;i<result[0].owned_islands_name.length;i++){
                                $('#dest_islands').append('<option>'+result[0].owned_islands_name[i].island_name+'</option>');
                            }

                            for(i=0;i<result[0].explored_islands_name.length;i++){
                                $('#dest_islands').append('<option>'+result[0].explored_islands_name[i].island_name+'</option>');
                            }
                        }
                    });
                    $('#_id').text("Registration No. : "+result[0]._id);
                    $('#source').text("Anchored at : "+result[0].source);
                    source = result[0].source;
                    $('#mod').prepend('<input id="ship_name" type="text" value='+result[0].name+'>');
                    $.ajax({
                        type:'POST',
                        url:'/get_island_info',
                        data:{island:result[0].source},
                        success: function(result){

                            // console.log(result);

                            produced = result[0].res_produced.res_name;
                            // console.log("Produced="+produced);

                            $('#res_table').empty();

                            if(result[0].owner_name != user){
                                $('#res_table').append(
                                    '<tr>'+
                                        '<th>Resource</th>'+
                                        '<th>For purchase</th>'+
                                        '<th>Buy</th>'+
                                    '</tr>'
                                );
                            }

                            else{
                                $('#res_table').append(
                                    '<tr>'+
                                        '<th>Resource</th>'+
                                        '<th>Quantity</th>'+
                                        '<th>Export Quantity</th>'+
                                    '</tr>'
                                );
                            }

                            j = 0;
                            
                            if(result[0].owner_name != user){
                                for(i=0;i<result[0].res_present.length;i++){
                                
                                    if(result[0].res_present[i].sell>0){
                                        limit[j++] = result[0].res_present[i].sell;
                                        // console.log(limit);
                                        $('#res_table').append(
                                            '<tr>'+
                                                '<td>'+result[0].res_present[i].name+'</td>'+
                                                '<td>'+result[0].res_present[i].sell+'</td>'+
                                                '<td><input type="number" name="res_input[]" id="'+result[0].res_present[i].name+'" value="0" min="0" max="'+result[0].res_present[i].sell+'"></td>'+
                                            '</tr>'
                                        );
                                    }
                                }
                            }

                            else{
                                for(i=0;i<result[0].res_present.length;i++){
                                
                                    if(result[0].res_present[i].quantity>0){
                                        limit[j++] = result[0].res_present[i].quantity;
                                        // console.log(limit);
                                        $('#res_table').append(
                                            '<tr>'+
                                                '<td>'+result[0].res_present[i].name+'</td>'+
                                                '<td>'+result[0].res_present[i].quantity+'</td>'+
                                                '<td><input type="number" name="res_input[]" id="'+result[0].res_present[i].name+'" value="0" min="0" max="'+result[0].res_present[i].quantity+'"></td>'+
                                            '</tr>'
                                        );
                                    }
                                }
                            }


                        }

                    });


                $('#s_source').text("Source: "+result[0].source);
                $('#s_destination').text("Destination: "+result[0].destination);
                $('#s_eta').text("eta: "+result[0].eta);

                $('#s_res_table').empty();

                            $('#s_res_table').append(
                                '<tr>'+
                                    '<th>Resource</th>'+
                                    '<th>Quantity</th>'+
                                '</tr>'
                            );

                            for(i=0;i<result[0].res_present.length;i++){
                                
                                if(result[0].res_present[i].quantity>0){
                                    $('#s_res_table').append(
                                        '<tr>'+
                                            '<td>'+result[0].res_present[i].name+'</td>'+
                                            '<td>'+result[0].res_present[i].quantity+'</td>'+
                                        '</tr>'
                                    );
                                }
                            }

                if (eta == 0)  // ship is anchored
                {
                    $("#sailing").children().hide(); 
                    $("#anchored").children().show(); 

                }
                else
                {
                    $("#anchored").children().hide(); 
                    $("#sailing").children().show(); 
                }
        }
    });


});