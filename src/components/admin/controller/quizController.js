const { appString } = require("../../utils/appString");
const Admin = require("../model/admin");

const Quiz = require("../model/quiz");
const quizController = {

    createQuiz: async (req, res) => {
        try {
            const { title, description, difficultyLevel, categoryId } = req.body;

            const quiz = await Quiz.create({
                title,
                description,
                difficultyLevel,
                categoryId,
            });

            return res.status(201).json({
                success: true,
                message: appString.QUIZCREATEDSUCCESS,
                data: quiz,
            });
        } catch (e) {
            console.log("ERROR CREATING QUIZ: ", e);
            return res.status(500).json({
                success: false,
                error: appString.SERVERERROR,
            });
        }
    },
    updateQuiz: async (req, res) => {
        try {
            const { title, description, difficultyLevel, categoryId } = req.body;
            const quiz = await Quiz.findById(req.params.id);
            if (!quiz) {
                return res
                    .status(404)
                    .json({ success: false, message: appString.QUIZNOTFOUND });
            }

            quiz.title = title;
            quiz.description = description;
            quiz.difficultyLevel = difficultyLevel;
            quiz.categoryId = categoryId;


            await quiz.save();

            return res.status(200).json({
                success: true,
                message: appString.QUIZUPDATED,
                data: quiz,
            });
        } catch (e) {
            console.log("ERROR UPDATING QUIZ : ", e);
            return res.status(500).json({
                success: false,
                error: appString.SERVERERROR,
            });
        }
    },
   
};
module.exports = quizController;
