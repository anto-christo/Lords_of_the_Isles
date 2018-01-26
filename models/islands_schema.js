var mongoose = require('mongoose');

var islandSchema = new mongoose.Schema({
    name: {type: String, default: null},
    owner_name: { type: String, default: "AI" },
    current_population: { type: Number, default: 0 },
    max_population: { type: Number, default: 0 },
    res_produced: { 
        res_name: { type: String, default: null }, 
        // res_quantity: { type: Number, default: 0 },
        // res_value: { type: Number, default: 0 }
    },
    res_present: [
    	{ 
    		name: { type: String, default: null },  
    		quantity: { type: Number, default: 0 },
    		// value: { type: Number, default: 0 }
    	},
    ],
    x_cord : {type: Number, default: 0},
    y_cord : {type: Number, default: 0},
    value: {type: Number, default: 0}
});

var islandSchema = mongoose.model('islands', islandSchema);
module.exports = islandSchema;