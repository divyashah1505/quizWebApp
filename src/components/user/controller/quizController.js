const Quiz = require("../../admin/model/quiz");
const Question = require("../../admin/model/question");
const { appString } = require("../../utils/appString");
const QuizAttempt = require("../models/quizAttepmt");
const User = require("../models/user");
const user = require("../models/user");
const { calculateQuestionPoints, updateUserStreak } = require("../../utils/commonUtils")
const quizController = {
    getQuizByLevel: async (req, res) => {
        try {
            console.log("Level Param", req.params.level);

            const level = parseInt(req.params.level);

            if (isNaN(level)) {
                return res.status(400).json({
                    success: false,
                    message: appString.INVALIDDIFFICULTYLEVEL
                });
            }

            const quiz = await Quiz.findOne({
                difficultyLevel: level,
                status: 1
            });

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: appString.QUIZNOTFOUND
                });
            }


            res.status(200).json({
                success: true,
                data: {
                    quizId: quiz._id,
                    title: quiz.title,
                    difficultyLevel: quiz.difficultyLevel,
                }
            });
        } catch (error) {

            console.log(error);

            res.status(500).json({
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
                return res.status(404).json({
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
                return res.status(400).json({
                    success: false,
                    message: "You already attempted this question"
                });
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
                     $inc:{score:isCorrect}

                },
                { upsert: true }
            );

            const totalQuestions = await Question.countDocuments({ quizId });

            const attempt = await QuizAttempt.findOne({ userId, quizId });

            if (attempt.answers.length === totalQuestions) {

                if (!timeTaken) {
                    return res.status(400).json({
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

                return res.json({
                    success: true,
                    message: appString.QUIZCOMPLETE,
                    score:attempt.score,
                    totalPoints,
                    streakBonus: streakData.streakBonus,
                    streakCount: user.streakCount
                });
            }

            return res.json({
                success: true,
                message: appString.ANSWERSUBMITTED
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                success: false,
                message: appString.SERVERERROR
            });
        }
    }
    


};
module.exports = quizController