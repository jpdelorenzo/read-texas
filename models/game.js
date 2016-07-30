var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var GameSchema = new Schema({
    id      : ObjectId,
    name    : String,
    user    : ObjectId
});

exports.Game = mongoose.model('Game', GameSchema);