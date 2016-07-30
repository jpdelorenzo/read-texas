var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var InstantSchema = new Schema({
    speed           : Number,
    distance        : Number,
    timestamp       : Date,
    mod             : Number,
    acceleration    : Number,
    time            : Number,
    game            : ObjectId
});

exports.Instant = mongoose.model('Instant', InstantSchema);