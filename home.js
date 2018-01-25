$(document).ready(function(){
    $('[data-toggle="popover"]').popover({
        placement : 'bottom',
        trigger : 'hover'
    });

    var x = 1;  // value to be taken from database
var text;
if (x==1) 
{
text =  "Already used random event for this tick";
}
else
{
text =  "Click to trigger random event";
}
$(document).ready(function(){
    $('[data-toggle="dice"]').popover({
        placement : 'bottom',
        trigger : 'hover',
        html : true,
        content : text
    });
});


    // var change_iframe_src = function(new_src) {
    //     $("#info-screen").attr('src', new_src);
    // }

    var m,min;
    var s,sec;
    var h,ms;
    var d,x,y,z;
    var sum,n,n1;
    var temp;
    var t;
    var current_tick = 0;

    setInterval(function(){ 
      myFunction()
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
    sum = m*60+h*3600+n*86400; // in secs
      d = new Date();
    n = d.getUTCDate();
    n1 = 20;                      //IMPORTANT : LATER MAKE N1 THE STARTING DATE OF MEGA EVENT
      adjust = n1*24*(60/dur);
      // x = document.getElementById("demo");
      y = document.getElementById("ticks");
      z = document.getElementById("timer");

      h = addZero(d.getUTCHours(), 2);
      m = addZero(d.getUTCMinutes(), 2);  
      s = addZero(d.getUTCSeconds(), 2);
      // ms = addZero(d.getUTCMilliseconds(), 3); 

      // x.innerHTML =n + ":" + h + ":" + m + ":" + s;

      sec = addZero(60 - s, 2);
      min = 60 - m -1 ;
      t = parseInt(min/dur);
      min = min - (t*dur);
      temp = sum / duration;
      current_tick = parseInt(temp) - adjust ;
      
      y.innerHTML = current_tick;
      z.innerHTML =min + ":" + sec;



  }

  

  if (true) {}
});


