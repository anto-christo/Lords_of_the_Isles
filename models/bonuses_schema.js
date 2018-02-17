var mongoose = require('mongoose');

var bonusSchema = new mongoose.Schema({
    player_name: { type: String, default: null },
    wacky_keyboard: [], // 0 not completed. 1 completed.

});

var bonusSchema = mongoose.model('bonus', bonusSchema);
module.exports = bonusSchema;