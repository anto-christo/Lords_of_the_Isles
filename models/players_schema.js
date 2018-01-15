var mongoose = require('mongoose');

var playerSchema = new mongoose.Schema({
    name: { type: String, default: null },
    gold: { type: Number, default: 1000 },
    wealth: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    random_event_used: { type: Number, default: 0 },
    explored_islands_name: [
    	{	island_name: {type: String, default: null}},
    ],
    owned_ships_id: [
		{	id: {type: String, default: null}},
    ],



});

var playerSchema = mongoose.model('players', playerSchema);
module.exports = playerSchema;