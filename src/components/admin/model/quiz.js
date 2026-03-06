const mongoose = require("mongoose");
const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
  
    difficultyLevel: {
        type: Number,  //0 for easy 1 for meduim 2 for hard
        required: true
    },
    totalquestion:{
        type:Number,
        default: 0
    },
    maincategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);
module.exports = mongoose.model("quiz", quizSchema);








