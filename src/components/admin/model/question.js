const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const quiz = require("../model/quiz")
const questionSchema = new mongoose.Schema({
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'quiz',
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    options: [
      {
        text: {
          type: String,
          required: true
        },
        isCorrect: {
          type: Number,
             //0 for incorrect 1 for correct 
          required: true
        }
      }
    ]
  }, { timestamps: true });
  
  module.exports = mongoose.model('question', questionSchema);