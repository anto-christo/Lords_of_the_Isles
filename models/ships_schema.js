var mongoose = require('mongoose');

var shipSchema = new mongoose.Schema({
    owner_name: { type: String, default: null },
    source: { type: String, default: null },
    destination: { type: String, default: null },
    res_present: [
    	{ 
    		res_name: { type: String, default: null },  // res1
    		res_quantity: { type: Number, default: 0 },
    	}
    ]
});

var shipSchema = mongoose.model('ships', shipSchema);
module.exports = shipSchema;