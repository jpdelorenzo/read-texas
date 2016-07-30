var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    id          : ObjectId,
    name        : String
});

exports.User = mongoose.model('User', UserSchema);