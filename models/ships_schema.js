var mongoose = require('mongoose');

var shipSchema = new mongoose.Schema({
    name: { type: String, default: "Ship" },
    owner_name: { type: String, default: null },
    source: { type: String, default: null },
    destination: { type: String, default: null },
    res_present: [
        {
            res_name: {type: String, default: null},
            quantity: {type: Number, default: 0}
        }
    ],
    value: {type: Number, default: 0},
    eta: {type: Number, default: 0}, // expected tick of arrival. (landing tick)
});

var shipSchema = mongoose.model('ships', shipSchema);
module.exports = shipSchema;