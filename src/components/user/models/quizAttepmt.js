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
                type: Number, // option index selected by user
                required: true
            },

            isCorrect: {
                type: Number, // 1 = correct, 0 = incorrect
                enum: [0, 1],
                default: 0
            }
        }
    ],

    score: {
        type: Number,
        default: 0
    },

    timeTaken: {
        type: Number, // seconds
        // required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);