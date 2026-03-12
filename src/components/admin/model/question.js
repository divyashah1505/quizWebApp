const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const quiz = require("../model/quiz")
const { validation } = require('../validation'); 

const questionSchema = new mongoose.Schema({
  quizId: {
    type: Schema.Types.ObjectId,
    ref: quiz,
    required: validation.required('Quiz ID'),
  },
  questionText: {
    type: String,
    required: validation.required('Question text'),
  },
  options: [{
    text: {
      type: String,
      required: validation.required('Option text'),
    },
    isCorrect: {
      type: Number, // 0 for incorrect 1 for correct
      required: validation.required('Correctness status'),
    }
  }]
}, { timestamps: true });
  
  module.exports = mongoose.model('question', questionSchema);