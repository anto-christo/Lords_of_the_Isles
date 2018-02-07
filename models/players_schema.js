var mongoose = require('mongoose');

var playerSchema = new mongoose.Schema({
    name: { type: String, default: null },
    gold: { type: Number, default: 5000 },
    island_wealth: { type: Number, default: 0 },
    total_wealth: { type: Number, default: 0 },
    empty_ship_slots: { type: Number, default: 0 },
    random_event_used: { type: Number, default: 0 },
    owned_islands_name: [
    	{	island_name: {type: String, default: null}},
    ],
    explored_islands_name: [
    	{	island_name: {type: String, default: null}},
    ],
    owned_ships_id: [
		{	id: {type: String, default: null}},
    ],



});

var playerSchema = mongoose.model('players', playerSchema);
module.exports = playerSchema;