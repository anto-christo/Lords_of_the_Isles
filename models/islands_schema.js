var mongoose = require('mongoose');

var islandSchema = new mongoose.Schema({
    owner_id: { type: Number, default: null },
    current_population: { type: Number, default: 0 },
    max_population: { type: Number, default: 0 },
    res_produced: { type: String, default: null },
    res_present: [
    	{ 
    		res_name: { type: String, default: null },  // res1
    		res_quantity: { type: Number, default: 0 },
    		res_value: { type: Number, default: 0 }
    	},
    ],
    x_cord : {type: Number, default: 0},
    y_cord : {type: Number, default: 0},
    island_value:{type: Number, default: 0}
});

var islandSchema = mongoose.model('islands', islandSchema);
module.exports = islandSchema;