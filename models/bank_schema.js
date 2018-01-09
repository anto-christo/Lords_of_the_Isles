var mongoose = require('mongoose');

var bankSchema = new mongoose.Schema({
    payee_id: { type: Number, default: 0 },
    principal_amount: { type: Number, default: 0 },
    interest_rate: { type: Number, default: 0 },
    period: { type: Number, default: 0 },
    start_tick: { type: Number, default: 0 },

});

var bankSchema = mongoose.model('bank', bankSchema);
module.exports = bankSchema;