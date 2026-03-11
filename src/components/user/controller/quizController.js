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

            const { quizId, answers } = req.body;
            const userId = req.user.id;

            const questions = await Question.find({ quizId });
            const quiz = await Quiz.findById(quizId);

            let score = 0;
            let totalPoints = 0;
            let processedAnswers = [];

            questions.forEach((q) => {

                const userAnswer = answers.find(
                    (a) => a.questionId == q._id
                );

                if (userAnswer) {

                    const correctIndex = q.options.findIndex(
                        (o) => o.isCorrect === 1
                    );

                    let isCorrect = 0;
                    let questionPoints = 0;

                    if (userAnswer.selectedOption === correctIndex) {

                        score++;
                        isCorrect = 1;

                        questionPoints = calculateQuestionPoints(
                            quiz.difficultyLevel,
                            userAnswer.timeTaken
                        );

                        totalPoints += questionPoints;
                    }

                    processedAnswers.push({
                        questionId: q._id,
                        selectedOption: userAnswer.selectedOption,
                        isCorrect,
                        timeTaken: userAnswer.timeTaken,
                        pointsEarned: questionPoints
                    });

                }

            });

            await QuizAttempt.create({
                userId,
                quizId,
                answers: processedAnswers,
                score
            });

            const user = await User.findById(userId);

            const streakData = updateUserStreak(user);

            const streakBonus = streakData.streakBonus;

            totalPoints += streakBonus;

            user.totalPoints += totalPoints;

            await user.save();

            res.json({
                success: true,
                score,
                pointsEarned: totalPoints,
                streakCount: user.streakCount,
                streakBonus
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