const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    image: {type: String, default: "ff"},
    password: {type: String, required: true, minlength: 6},
    googleId: {type: String},
    stories: [{type: mongoose.Types.ObjectId, ref: 'Story'}],
    followers: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    following: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    disabled: {type: Boolean, default: false},
    joinedOn: {type: String, required: true}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
