const mongoose = require("mongoose");
const { validation } = require('../validation');
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: validation.required('Name'),
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: '',
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    default: null,
  },
  status: {
    type: Number,
    default: 1
  },
}, { timestamps: true });

module.exports = mongoose.model("category", categorySchema);
