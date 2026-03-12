const mongoose = require("mongoose");
const { validation } = require('../validation');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: validation.required('Title'),
  },
  description: {
    type: String,
  },
  difficultyLevel: {
    type: Number, // 0 for easy 1 for medium 2 for hard
    required: validation.required('Difficulty level'),
  },
  totalquestion: {
    type: Number,
    default: 0
  },
  maincategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required: validation.required('Category ID'),
  },
  status: {
    type: Number,
    default: 1
  },
}, { timestamps: true });
module.exports = mongoose.model("quiz", quizSchema);








