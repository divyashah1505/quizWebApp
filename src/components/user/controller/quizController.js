// const Quiz = require("../../admin/model/quiz");
const Question = require("../../admin/model/question");
const { appString } = require("../../utils/appString");
const QuizAttempt = require("../models/quizAttepmt");
const User = require('../models/user');
const Quiz = require('../../admin/model/quiz'); 

const { calculateQuestionPoints, updateUserStreak, error, success } = require("../../utils/commonUtils")
const quizController = {
    getQuizByLevel: async (req, res) => {
        try {
            console.log("Level Param", req.params.level);

            const level = parseInt(req.params.level);

            if (isNaN(level)) {
                return error(res,{
                    success: false,
                    message: appString.INVALIDDIFFICULTYLEVEL
                });
            }

            const quiz = await Quiz.findOne({
                difficultyLevel: level,
                status: 1
            });

            if (!quiz) {
                return error(res, appString.QUIZNOTFOUND, 404); 
            }


            return success(res,{
                success: true,
                data: {
                    quizId: quiz._id,
                    title: quiz.title,
                    difficultyLevel: quiz.difficultyLevel,
                }
            });
        } catch (error) {

            console.log(error);

            return error(res,{
                success: false,
                message: appString.SERVERERROR
            });
        }
    },
    submitQuiz: async (req, res) => {
        try {

            const { quizId, questionId, selectedOption, timeTaken } = req.body;
            const userId = req.user.id;

            const question = await Question.findById(questionId);
            const quiz = await Quiz.findById(quizId);

            if (!question) {
                return error(res,{
                    success: false,
                    message: appString.QUESTIONNOTFOUND
                });
            }

            const alreadyAttempted = await QuizAttempt.findOne({
                userId,
                quizId,
                "answers.questionId": questionId
            });

            if (alreadyAttempted) {
                return error(res,{
                    success: false,
                    message: appString.ALREDYATTEMPTEDQUESTION
                });
            }

          const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { attemptedQuizes: quizId } },
      { new: true, runValidators: true } 
    ).populate('attemptedQuizes'); 

    if (!updatedUser) {
      return error(res,{ success: false, message: 'User not found' });
    }
            const correctIndex = question.options.findIndex(
                (o) => o.isCorrect === 1
            );

            let isCorrect = 0;
            let pointsEarned = 0;

            if (selectedOption === correctIndex) {
                isCorrect = 1;
            }

            await QuizAttempt.updateOne(
                { userId, quizId },
                {
                    $push: {
                        answers: {
                            questionId,
                            selectedOption,
                            isCorrect
                        }
                    },
                    $inc: { score: isCorrect }

                },
                { upsert: true }
            );

            const totalQuestions = await Question.countDocuments({ quizId });

            const attempt = await QuizAttempt.findOne({ userId, quizId });

            if (attempt.answers.length === totalQuestions) {

                if (!timeTaken) {
                    return error(res,{
                        success: false,
                        message: appString.TIMETAKENREQUIREDFORLAST
                    });
                }

                let totalPoints = 0;

                for (let ans of attempt.answers) {

                    if (ans.isCorrect === 1) {

                        const questionPoints = calculateQuestionPoints(
                            quiz.difficultyLevel,
                            timeTaken
                        );

                        ans.pointsEarned = questionPoints;

                        totalPoints += questionPoints;
                    }
                }

                const user = await User.findById(userId);

                const streakData = updateUserStreak(user);

                totalPoints += streakData.streakBonus;

                user.totalPoints += totalPoints;

                await user.save();

                await attempt.save();

                return success(res,{
                    success: true,
                    message: appString.QUIZCOMPLETE,
                    score: attempt.score,
                    totalPoints,
                    streakBonus: streakData.streakBonus,
                    streakCount: user.streakCount,
                    attemptedQuizes: updatedUser.attemptedQuizes
                });
            }

            return success(res,{
                success: true,
                message: appString.ANSWERSUBMITTED
            });

        } catch (error) {

            console.log(error);

           return error(res,{
                success: false,
                message: appString.SERVERERROR
            });
        }
    }



};
module.exports = quizController