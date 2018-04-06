var user = localStorage.getItem("user");
var ship = localStorage.getItem("s_id");
var produced = null;
var source = null;
var limit = [];
var index;
var acc_res = [];
var prices_s = [];
var prices_d = [];
var ship_cap;
// console.log("Ship="+ship);
var dest;
var price;
 var res_names_arr = [
    "bread", //0
    "fruits",  //1
    "cheese",  //2
    "wood",//3
    "stone", //4
    "wheat",  //5
    "bamboo",  //6
    "ale", //7
    "cotton",  //8
    "silk", //9
    "honey",  //10
    "fur",//11
    "gems", //12
    "chocolate",  //13
    "spices", //14
  ];
var res_names=[];
var res_qtys=[];

var ship_eta = 0;
var operating_cost = 0;
var x1;
var y1;
var x2;
var y2;
var xt;
var yt;
var speed = 0;
var profit = 0;
var values = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var dest_owner;
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
    dest = $('#dest_islands option:selected').text();
    if(dest == 'Select Destination')
        alert("Please select a destination");
    else if(source == dest)
        alert("Destination cannot be same as Source !!");
    else{

        res_qtys = $("input[name='res_input[]']").map(function(){return $(this).val();}).get();

        res_names = $("input[name='res_input[]']").map(function(){return $(this).attr('id');}).get();
        console.log(res_names);

        var valid = 1;
        var add = 0;
        var cost_buying = 0;
        var cost_selling = 0;
        var index;
        
        console.log("res_names.length "+res_names.length);
        console.log("res_qtys.length "+res_qtys.length);
        console.log("prices_s "+prices_s);
        console.log("prices_d "+prices_d);
         for (var i = 0; i < res_names.length; i++) 
         {
                index = res_names_arr.indexOf(res_names[i]);
                console.log("index: "+ index);
                if (Number(res_qtys[i])>limit[i]) 
                {
                    valid = 0;
                }
                add = add + Number(res_qtys[i]);
                console.log("prices_s[i] "+prices_s[index]);
                console.log("prices_d[i] "+prices_d[index]);
                cost_buying = cost_buying + prices_s[index]*Number(res_qtys[i]);
                cost_selling = cost_selling + prices_d[index]*Number(res_qtys[i]);
         }
         console.log("cost_buying "+ cost_buying);
         console.log("cost_selling "+ cost_selling);
        
        if (valid==1) 
        {
                console.log("in valid res_names.length "+res_names.length);
                console.log("in valid res_qtys.length "+res_qtys.length);

            // res_names = res_names;
            if (add<=ship_cap) 
            {
                    console.log("in add < ship_cap: ");
                
                    $.ajax({
                        type:'POST',
                        url:'/check_feasible',
                        dataType: "json",
                        async:false,
                        data:{user:user,src:source,dest:dest,cb:cost_buying,cs:cost_selling,oc:operating_cost},
                        error: function(data){
                            console.log("in check feasible error")
                        },
                        success: function(data){

                            console.log("data.message: "+data.message);
                            if (data.message=="status0") 
                            {
                                $.ajax({
                                    type:'POST',
                                    url:'/send_ship',
                                    dataType: "json",
                                    async:false,
                                    data:{user:user, ship:ship, names:JSON.stringify( res_names), qtys:JSON.stringify( res_qtys), src:source,dest:dest},
                                    error: function(data){
                                        console.log("in send ship error")
                                    },
                                    success: function(data){
                                        alert("Ship has set sail successfully !!");
                                    }
                                }); 
                            }
                            else if (data.message=="status1") 
                            {
                                alert("Destination doesnt have enough gold to pay you. You decided not to send goods");
                            }
                            else if (data.message=="status2") 
                            {
                                alert("Your dont have enough gold to buy these goods!!");
                            }
                        }
                    })
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

function view_market()
{
    dest = $('#dest_islands option:selected').text();
    if(dest == 'Select Destination')
        alert("Please select a destination");
    else
    {
        // console.log("in view")
        prices_d=[];
        console.log("dest: "+dest);
        $.ajax({
            type:'POST',
            url:'/get_island_info',
            data:{island:dest},
            success: function(object){
                dest_result = object.result;
                prices_d = object.prices;
                dest_owner = dest_result[0].owner_name;
                x2 = dest_result[0].x_cord;
                y2 = dest_result[0].y_cord;
               
              

                if(dest_result[0].owner_name == user){
                    $('#dest_res_table').empty();
                    $('#dest_res_table').append(
                        '<tr>'+
                            '<th>Resource | </th>'+
                            '<th>Accepting</th>'+
                        '</tr>'
                    );
                    index = 0;
                    j = 0;
                    for(i=0;i<dest_result[0].res_present.length;i++){
                        price = 0; //calculate actual price here
                        if(dest_result[0].res_present[i].sell>0){
                            limit[j++] = Math.abs(dest_result[0].res_present[i].sell);
                            // console.log(limit);
                            acc_res[index++] = i;

                            $('#dest_res_table').append(
                                '<tr>'+
                                    '<td>'+dest_result[0].res_present[i].name+'</td>'+
                                    '<td>'+dest_result[0].res_present[i].sell+'</td>'+
                                '</tr>'
                            );
                        }
                    }

                }
                else
                {
                    $('#dest_res_table').empty();
                    $('#dest_res_table').append(
                        '<tr>'+
                            '<th>Resource | </th>'+
                            '<th>Accepting | </th>'+
                            '<th>Price</th>'+
                            // '<th>Buy</th>'+
                        '</tr>'
                    );
                    index = 0;

                    j = 0;
                    for(i=0;i<dest_result[0].res_present.length;i++){
                        price = 0; //calculate actual price here
                        if(dest_result[0].res_present[i].sell>0){
                            limit[j++] = Math.abs(dest_result[0].res_present[i].sell);
                            // console.log(limit);
                            acc_res[index++] = i;

                            $('#dest_res_table').append(
                                '<tr>'+
                                    '<td>'+dest_result[0].res_present[i].name+'</td>'+
                                    '<td>'+dest_result[0].res_present[i].sell+'</td>'+
                                    '<td>'+prices_d[i]+'</td>'+
                                '</tr>'
                            );
                        }
                    }
                }
                    get_island_info();

            }
        });



        $('#send_button').show();
        $('#view_button').hide();
        $('#view_div').hide();
        $('#res_table').show();
        $('#dest_islands').hide();
        $('#destination').show();
        $('#dest_res_table').show();

        $('#class').hide();
        $('#speed').hide();
        $('#capacity').hide();

        $('#ship_eta').show();
        $('#ship_operating_cost').show();
        $('#profit').show();
         
        $('#destination').text("Destination: "+dest);
        // console.log("dest: "+dest);
    }
}

function getSum(total, num) {
    return total + num;
}


function get_island_info()
{
    // console.log("source : "+source);
                    prices_s=[];
                    $.ajax({
                        type:'POST',
                        url:'/get_island_info',
                        data:{island:source},
                        success: function(object){
                            result = object.result;
                            x1 = result[0].x_cord;
                            y1 = result[0].y_cord;
                            xt= x2-x1;
                            yt= y2-y1;
                            ship_eta = Math.sqrt(xt*xt+yt*yt);
                            ship_eta = Math.ceil(ship_eta/200);
                            ship_eta = Math.floor(ship_eta/speed)+1;
                            if (ship_eta>9) 
                            {
                              ship_eta = 9;
                            }
                            operating_cost = ship_eta*15;
                            $('#ship_eta').text("ETA: "+ship_eta + " Ticks");
                            $('#ship_operating_cost').text("Operating cost: "+operating_cost + " gold");

                            
                            prices_s = object.prices;

                            $('#res_table').empty();

                            if(result[0].owner_name != user){
                                $('#res_table').append(
                                    '<tr>'+
                                        '<th>Resource | </th>'+
                                        '<th>For purchase | </th>'+
                                        '<th>Price | </th>'+
                                        '<th>Buy</th>'+
                                    '</tr>'
                                );
                            }

                            else{
                                $('#res_table').append(
                                    '<tr>'+
                                        '<th>Resource | </th>'+
                                        '<th>Quantity | </th>'+
                                        // '<th>Price</th>'+
                                        '<th>Export Quantity</th>'+
                                    '</tr>'
                                );
                            }

                            j = 0;
                            profit = 0;
                            if(result[0].owner_name != user){
                                for(i=0;i<result[0].res_present.length;i++){
                                    price = 0; //calculate actual price here
                                    if(result[0].res_present[i].sell<0){
                                        if(acc_res.indexOf(i)!=-1) // dest accepting, source selling confirmed.
                                        {
                                            $('#res_table').append(
                                                '<tr>'+
                                                    '<td>'+result[0].res_present[i].name+'</td>'+
                                                    '<td>'+Math.abs(result[0].res_present[i].sell)+'</td>'+
                                                    '<td>'+prices_s[i]+'</td>'+
                                                    '<td><input type="number" name="res_input[]" id="1'+result[0].res_present[i].name+'" value="0" min="0" max="'+Math.abs(result[0].res_present[i].sell)+'"></td>'+
                                                '</tr>'
                                            );
                                        }
                                         var res_name = result[0].res_present[i].name;
                                            console.log("res name: "+res_name)
                                            $( "#1"+res_name ).keyup(function() {
                                                profit = 0;
                                                index = res_names_arr.indexOf(res_name);
                                                values[index] = $('#1'+res_name).val()
                                                if (dest_owner==user) 
                                                {
                                                    // source not mine, dest mine
                                                    for (var i = 0; i < 15; i++) {
                                                        if (values[i]!=null) 
                                                        {
                                                            profit = profit-values[i]*prices_s[i];
                                                        }
                                                    }
                                                }
                                                else
                                                {
                                                    //both not mine
                                                    for (var i = 0; i < 15; i++) {
                                                        if (values[i]!=null) 
                                                        {
                                                            var temp_cal = values[i]*prices_d[i]-values[i]*prices_s[i];
                                                            profit = profit+temp_cal;
                                                        }
                                                    }
                                                }
                                               
                                                if (profit < 0) 
                                                {
                                                    $('#profit').text("Loss: "+profit);
                                                    $('#profit').css({"color":"red"});
                                                }
                                                else
                                                {
                                                     $('#profit').css({"color":"green"});
                                                }
                                            });
                                    }
                                }
                            }

                            else{ // source mine

                                for(i=0;i<result[0].res_present.length;i++){
                                    price = 0; //calculate actual price here
                                    if(result[0].res_present[i].quantity>0){
                                        // console.log("index: "+acc_res.indexOf(i));
                                        if(acc_res.indexOf(i)!=-1) // dest accepting, source selling confirmed.
                                        {
                                            // limit[j++] = result[0].res_present[i].quantity;
                                            // console.log(limit);
                                            $('#res_table').append(
                                                '<tr>'+
                                                    '<td>'+result[0].res_present[i].name+'</td>'+
                                                    '<td>'+result[0].res_present[i].quantity+'</td>'+
                                                    // '<td>'+price+'</td>'+
                                                    '<td><input type="number" name="res_input[]" id="'+result[0].res_present[i].name+'" value="0" min="0" max="'+result[0].res_present[i].quantity+'"></td>'+
                                                '</tr>'
                                            );

                                        }
                                        var res_name = result[0].res_present[i].name;
                                            console.log("res name: "+res_name)
                                            $( "#"+res_name ).keyup(function() {
                                                profit = 0;
                                                index = res_names_arr.indexOf(res_name);
                                                values[index] = $('#'+res_name).val()
                                                    if (dest_owner==user) 
                                                    {
                                                        profit = 0;
                                                    }
                                                    else
                                                    {
                                                        for (var i = 0; i < 15; i++) {
                                                            console.log("in 1")
                                                            profit = profit+values[i]*prices_d[i];
                                                        }
                                                        
                                                    }

                                                
                                                if (profit < 0) 
                                                {
                                                    $('#profit').text("Loss: "+profit);
                                                    $('#profit').css({"color":"red"});
                                                }
                                                else
                                                {
                                                     $('#profit').css({"color":"green"});
                                                }
                                            });
                                    }
                                }
                            }
                          }
                        });
}

$(document).ready(function(){
    $('#res_table').hide();
    $('#send_button').hide();
    $('#destination').hide();
    $('#dest_res_table').hide();
    $('#ship_eta').hide();
    $('#ship_operating_cost').hide();
    $('#profit').hide();

    $.ajax({
        type:'POST',
        url:'/get_ship_info',
        data:{ship:ship},
        success: function(result){
                speed = result[0].speed;
                var eta = result[0].eta;
                ship_cap = result[0].capacity;
                $('#class').text("Class: "+result[0].class);
                $('#speed').text("Speed: "+result[0].speed);
                $('#capacity').text("Capacity: "+result[0].capacity);
                source = result[0].source;
                    // console.log("here source : "+source);
                    $('#ship_name').text("Ship Name : "+result[0].name);

                    $.ajax({
                        type:'POST',
                        url:'/get_island',
                        data:{user:user},
                        success: function(result){
                           // console.log("outer result: "+result[0].owned_islands_name.length)
                            for(i=0;i<result[0].owned_islands_name.length;i++){
                                if (result[0].owned_islands_name[i].island_name!=source) 
                                {
                                    $('#dest_islands').append('<option>'+result[0].owned_islands_name[i].island_name+'</option>');
                                }
                            }

                            for(i=0;i<result[0].explored_islands_name.length;i++){
                                if (result[0].explored_islands_name[i].island_name!=source) 
                                {
                                    $('#dest_islands').append('<option>'+result[0].explored_islands_name[i].island_name+'</option>');
                                }
                            }

                    //$('#_id').text("Registration No. : "+result[0]._id);
                    $('#source').text("Anchored at : "+source);
                    // source = result[0].source;
                    
                    
                    
                }
                
            });
            
            $('#mod').prepend('<input id="ship_name" type="text" value='+result[0].name+'>');

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