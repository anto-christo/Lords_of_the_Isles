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
    class: {type: String, default: "D"},
    speed: {type: Number, default: 0},
    capacity: {type: Number, default: 0},
    eta: {type: Number, default: 0}, // expected tick of arrival. (landing tick)
});

var shipSchema = mongoose.model('ships', shipSchema);
module.exports = shipSchema;


// Model Buying_Cost Speed Capacity
// S       5000        3       800
// A       3000        2       500
// B       1500        2       250
// C       1500        1       500
// D       800         1       200         