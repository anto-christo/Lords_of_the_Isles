var mongoose = require('mongoose');

var shipSchema = new mongoose.Schema({
    name: { type: String, default: "Ship" },
    owner_name: { type: String, default: null },
    source: { type: String, default: null },
    destination: { type: String, default: null },

    res_present: [
        {
            res_name: {type: String, default: "copper"},
            quantity: {type: Number, default: 0}
        }
    ],

    // res_present: [
    //     {
    //         name: {type: String, default: "copper"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "iron"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "bronze"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "wood"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "coal"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "aluminium"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "oil"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "uranium"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "diamond"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "lead"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "rice"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "wheat"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "emerald"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "coconut"},
    //         quantity: {type: Number, default: 0}
    //     },

    //     {
    //         name: {type: String, default: "salt"},
    //         quantity: {type: Number, default: 0}
    //     }
    // ],

    value: {type: Number, default: 0}
});

var shipSchema = mongoose.model('ships', shipSchema);
module.exports = shipSchema;