var mongoose = require('mongoose');

var shipSchema = new mongoose.Schema({
    owner_id: { type: Number, default: 0 },
    source: { type: String, default: null },
    destination: { type: String, default: null },
    res_present: [
    	{ 
    		res_name: { type: String, default: null },  // res1
    		res_quantity: { type: Number, default: 0 },
    	},
    	{ 
    		res_name: { type: String, default: null },  // res2
    		res_quantity: { type: Number, default: 0 },

    	},
    	{ 
    		res_name: { type: String, default: null },  // res3
    		res_quantity: { type: Number, default: 0 },

    	},
    	{ 
    		res_name: { type: String, default: null },  // res4
    		res_quantity: { type: Number, default: 0 },
    	},
    	{ 
    		res_name: { type: String, default: null },  // res5
    		res_quantity: { type: Number, default: 0 },
    	},
  		// total 15 like this. i.e. 10 more
    ],

});

var shipSchema = mongoose.model('ships', shipSchema);
module.exports = shipSchema;