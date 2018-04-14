$(document).ready(function(){
    
  var person = localStorage.getItem("user");

  $.ajax({
    type:'POST',
    url:'/tut_status',
    dataType:'json',
    data:{name:person},
    error:function(data){
      console.log("error");
      console.log(data)
    },
    success: function(data){
      console.log("in success data:"+data)
      if(data.status=="enabled"){
        $('#intro').modal('show');
      }
      else if(data.status=="disabled"){
      }
    }
  });

    var m,min;
    var s,sec;
    var h,ms;
    var d,x,y,z;
    var sum,n,n1;
    var temp;
    var t;
    var current_tick = 0;

    setInterval(function(){ 
      myFunction();
      
    }, 1000);

  function addZero(x,n) {
      while (x.toString().length < n) {
          x = "0" + x;
      }
      return x;
  }
  

  var dur = 10; // 10 mins i.e. 6 ticks per hour
  var duration = dur* 60; 
  var adjust;
  function myFunction() {
    if (min=="0"&&sec=="55") 
      {
        console.log("refreshing");
        var ifr = document.getElementById('info-screen');  
        ifr.src = ifr.src;

        var iframe = document.getElementById('event-log');  
        iframe.src = iframe.src;
      }

  var sum = m*60+h*3600+n*86400; // in secs
      d = new Date();
    n = d.getUTCDate();
    n1 = 6;                      //IMPORTANT : LATER MAKE N1 THE STARTING DATE OF MEGA EVENT
      adjust = n1*24*(60/dur)-33;
      y = document.getElementById("ticks");
      z = document.getElementById("timer");

      h = addZero(d.getUTCHours(), 2);
      m = addZero(d.getUTCMinutes(), 2);  
      s = addZero(d.getUTCSeconds(), 2);

      sec = addZero(60 - s, 2);
      min = 60 - m -1 ;
      t = parseInt(min/dur);
      min = min - (t*dur);
      temp = sum / duration;
      current_tick = parseInt(temp) - adjust ;
      console.log("current_tick "+ current_tick);
      y.innerHTML = current_tick;
      z.innerHTML =min + ":" + sec;
    
      
  }
});


