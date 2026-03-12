const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },

    answers: [
        {
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question",
                required: true
            },

            selectedOption: {
                type: Number,
                required: true
            },

            isCorrect: {
                type: Number, // 1 = correct, 0 = incorrect
                default: 0
            }
        }
    ],

    score: {
        type: Number,
        default: 0
    },

    timeTaken: {
        type: Number,
    }

}, { timestamps: true });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);