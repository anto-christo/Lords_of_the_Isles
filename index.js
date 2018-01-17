var player;
var old = -1;

$(document).ready(function(){
    $('[data-toggle="popover"]').popover({
        placement : 'left',
        trigger : 'hover'
    });

    function send_player_name()
    {
    $.ajax({
        type: 'POST',
        url: '/player_name',
        data: { username:person },
        dataType: 'json',

        });
    }

function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    user=getCookie("username");
    if (user != "") {
        player = user;
        old = 1;
        alert("Welcome again " + user);
    } else {
      flag = 1;
    }
}

var person="";
    var user = "";
    var flag = 0;
    checkCookie();
    if (flag==1) {
        while(!person)
        {
          person  = prompt("Please enter your name");
          player = person;
          old = 0;
        }
        setCookie("username", person, 30);
        send_player_name();
        console.log(person);
    }
});