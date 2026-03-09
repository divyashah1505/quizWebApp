const Question = require("../model/question");
const { appString } = require("../../utils/appString");
const Quiz = require("../model/quiz")
const questionController = {

    createQuestion: async (req, res) => {
        try {
            const { questionText, options, quizId } = req.body;

            if (!questionText || !options || !quizId) {
                return res.status(400).json({
                    success: false,
                    error: "Please provide all the required fields (including quizId)"
                });
            }

            const currentQuestionCount = await Question.countDocuments({ quizId });
            if (currentQuestionCount >= 10) {
                return res.status(400).json({
                    success: false,
                    error: appString.QUIZQUESTIONLIMIT
                });
            }

            if (!Array.isArray(options) || options.length < 4) {
                return res.status(400).json({
                    success: false,
                    error: appString.OPTIONWITHARRAYLIMITWITH4
                });
            }

            const correctOptionsCount = options.filter(opt => opt.isCorrect === 1).length;

            if (correctOptionsCount !== 1) {
                return res.status(400).json({
                    success: false,
                    error: correctOptionsCount === 0
                        ? appString.ONEOPTIONCORRECT
                        : appString.MULTIPLECOORECTANSWERNOTALLOWED
                });
            }

            for (const option of options) {
                if (typeof option.text !== "string" || typeof option.isCorrect !== "number") {
                    return res.status(400).json({
                        success: false,
                        error: appString.TEXTASSTRINGISCOORECTASNUMBER
                    });
                }
            }

            const newQuestion = await Question.create({
                quizId,
                questionText,
                options,
            });

            await Quiz.findByIdAndUpdate(quizId, {
                $inc: { totalquestion: 1 }
            });

            return res.status(201).json({
                success: true,
                message: appString.QUESTIONCREATED,
                data: newQuestion,
            });

        } catch (e) {
            console.log("ERROR CREATING QUESTION: ", e);
            return res.status(500).json({
                success: false,
                error: e.message || appString.SERVERERROR
            });
        }
    },

    updateQuestion: async (req, res) => {
        try {
            const { questionText, options } = req.body;
            const { id } = req.params;

            if (!questionText || !options) {
                return res.status(400).json({
                    success: false,
                    error: "Please provide question text and options.",
                });
            }

            if (!Array.isArray(options) || options.length < 4) {
                return res.status(400).json({
                    success: false,
                    error: appString.OPTIONWITHARRAYLIMITWITH4,
                });
            }

            for (const option of options) {
                if (
                    typeof option.text !== "string" ||
                    typeof option.isCorrect !== "number"
                ) {
                    return res.status(400).json({
                        success: false,
                        error: appString.TEXTASSTRINGISCOORECTASNUMBER,
                    });
                }
            }

            const question = await Question.findByIdAndUpdate(
                id,
                { questionText, options },
                { new: true }
            );

            if (!question) {
                return res.status(404).json({
                    success: false,
                    error: appString.QUESTIONNOTFOUND,
                });
            }

            return res.status(200).json({
                success: true,
                message: appString.QUESTIONUPDATED,
                question,
            });
        } catch (e) {
            console.error("ERROR UPDATING QUESTION:", e.message);
            return res.status(500).json({
                success: false,
                error: appString.SERVERERROR,
            });
        }
    }
};

module.exports = questionController;