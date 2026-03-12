const { appString } = require("../../utils/appString");
const { error, success } = require("../../utils/commonUtils");
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

            return success(res,{
                success: true,
                message: appString.QUIZCREATEDSUCCESS,
                data: quiz,
            });
        } catch (e) {
            console.log("ERROR CREATING QUIZ: ", e);
            return error(res,{
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
                return error(res,{ success: false, message: appString.QUIZNOTFOUND });
            }

            quiz.title = title;
            quiz.description = description;
            quiz.difficultyLevel = difficultyLevel;
            quiz.categoryId = categoryId;


            await quiz.save();

            return success(res,{
                success: true,
                message: appString.QUIZUPDATED,
                data: quiz,
            });
        } catch (e) {
            console.log("ERROR UPDATING QUIZ : ", e);
            return error(res,{
                success: false,
                error: appString.SERVERERROR,
            });
        }
    },
   
};
module.exports = quizController;
