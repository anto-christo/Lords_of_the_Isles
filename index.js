var player;

$(document).ready(function(){
    $('[data-toggle="popover"]').popover({
        placement : 'left',
        trigger : 'hover'
    });

    function send_player_name(person)
    {
    $.ajax({
        type: 'POST',
        url: '/player_name',
        data: { username:person },
        success: function(data){
            console.log("Player check complete");
        }
        });
    }

    var person = prompt("Enter your name:");

    player = person;
    
    send_player_name(person);
});