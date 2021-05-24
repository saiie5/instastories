const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storySchema = new Schema({
    title: {type: String, required: true},
    intro: {type: String, required: true},
    isAnonymous: {type: Boolean, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    category: [{type: mongoose.Types.ObjectId, default: ["Undisclosed Genre"], ref: "Category"}],
    featured: {type: Boolean, default: false},
    creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    likedBy: [{type: mongoose.Types.ObjectId, ref: 'User', required: true}],
    createdOn: {type: String, required: true}
});

module.exports = mongoose.model('Story', storySchema);
