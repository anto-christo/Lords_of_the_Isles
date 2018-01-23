var user;

$(document).ready(function(){

    user = player;

    $('#user_name').text("Current User: "+user);

    $.ajax({
        type:'POST',
        url:'/get_island',
        data:{user:user},
        success: function(result){

            console.log(result);
            
            for(i=0;i<result[0].owned_islands_name.length;i++){
                $('#islands').append('<option>'+result[0].owned_islands_name[i].island_name+'</option>');
            }
        }
    });
});