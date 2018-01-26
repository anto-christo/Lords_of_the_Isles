
var user = localStorage.getItem("user");
var ship = localStorage.getItem("s_id");

console.log("Ship="+ship);

function rename(){

    var name = $('#ship_name').val();
    console.log("Name:"+name);

    $.ajax({
        type: 'POST',
        url: '/rename_ship',
        data: {ship:ship, name:name},
        success: function(data){
            console.log("Rename successfull");
            parent.window.ship_menu.location.reload();
        }
    });
}


$(document).ready(function(){

    $.ajax({
        type:'POST',
        url:'/get_island',
        data:{user:user},
        success: function(result){

            console.log(result);
            
            for(i=0;i<result[0].owned_islands_name.length;i++){
                $('#islands').append('<option>'+result[0].owned_islands_name[i].island_name+'</option>');
            }

            for(i=0;i<result[0].explored_islands_name.length;i++){
                $('#islands').append('<option>'+result[0].explored_islands_name[i].island_name+'</option>');
            }
        }
    });

    $.ajax({
        type:'POST',
        url:'/get_ship_info',
        data:{ship:ship},
        success: function(result){

            console.log("Ship details");
            console.log(result);
            
                $('#_id').text("Registration No. : "+result[0]._id);
                $('#source').text("Anchored at : "+result[0].source);

                $('#mod').prepend('<input id="ship_name" type="text" value='+result[0].name+'>');

                $.ajax({
                    type:'POST',
                    url:'/get_island_info',
                    data:{island:result[0].source},
                    success: function(result){

                        console.log(result);

                        $('#res_table').empty();

                        $('#res_table').append(
                            '<tr>'+
                                '<th>Resource</th>'+
                                '<th>Quantity</th>'+
                                '<th>Value</th>'+
                                '<th>Export Quantity</th>'+
                            '</tr>'+
                            '<tr>'+
                                '<td>'+result[0].res_produced.res_name+'</td>'+
                                '<td>'+result[0].res_produced.res_quantity+'</td>'+
                                '<td>'+result[0].res_produced.res_value+'</td>'+
                                '<td><input type="number" id="result[0].res_produced.res_name" value="0" min="0" max="result[0].res_produced.res_quantity"></td>'+
                            '</tr>'
                        );

                        for(i=0;i<result[0].res_present.length;i++){
                            $('#res_table').append(
                                '<tr>'+
                                    '<td>'+result[0].res_present[i].res_name+'</td>'+
                                    '<td>'+result[0].res_present[i].res_quantity+'</td>'+
                                    '<td>'+result[0].res_present[i].res_value+'</td>'+
                                '</tr>'
                            );
                        }
                    }

                });
        }
    });


});