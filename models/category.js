const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "Undisclosed Genre"
  },
});

exports.model = new mongoose.model('Category', categorySchema);
exports.categorySchema = categorySchema;
