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
            person = response.name;
            localStorage.setItem("user", person);
            send_player_name(person);
            
        }
        });

    function send_player_name(person)
    {
        $.ajax({
            type: 'POST',
            url: '/player_name',
            data: { username:person },
            success: function(data){
            }
            });
        }
    
});