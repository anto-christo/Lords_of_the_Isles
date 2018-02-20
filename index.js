$(document).ready(function(){
    var person;
    $('[data-toggle="popover"]').popover({
        placement : 'left',
        trigger : 'hover'
    });
    $.ajax({
        type: 'POST',
        url: '/get_username',
        dataType: 'json',
        async: false,
        success:function(response){
            // console.log(response.name);
            person = response.name;
            // console.log("now the username is : "+ person );
            localStorage.setItem("user", person);
            // console.log(localStorage.getItem("user"));
            send_player_name(person);
            
        }
        });

    function send_player_name(person)
    {
         // console.log("in send_player_name" + person);
        $.ajax({
            type: 'POST',
            url: '/player_name',
            data: { username:person },
            success: function(data){
                // console.log("Player check complete");
            }
            });
        }
    
});