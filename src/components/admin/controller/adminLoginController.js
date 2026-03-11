const Admin = require("../model/admin");
const { generateTokens, success, error } = require("../../utils/commonUtils");
const { appString } = require("../../utils/appString");
const Quiz = require("../model/quiz")
const Question = require("../model/question")
const adminController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const adminExists = await Admin.findOne({});

      if (adminExists) {
        return error(res, appString.ADMINALREDY_REGISTER, 409);
      }
      const newAdmin = await Admin.create({ username, email, password });
      const tokens = generateTokens(newAdmin._id);
      return success(
        res,
        { admin: newAdmin, ...tokens },
        appString.ADMIN_CREATED,
        201,
      );
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return error(res, `${field} already exists`, 409);
      }
      return error(res, err.message || appString.REGISTRATION_FAILED, 400);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email });
      if (!admin || !(await admin.matchPassword(password))) {
        return error(res, appString.INVALID_CREDENTIALS, 401);
      }

      const tokens = await generateTokens(admin);
      success(
        res,
        { username: admin.username, email: admin.email, ...tokens },
        appString.LOGIN_SUCCESS,
      );
    } catch (err) {
      error(res, err.message || appString.LOGIN_FAILED, 500);
    }
  },
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

            const questions = await Question.find({ quizId: quiz._id })
                .select("-options.isCorrect")
                .limit(10);

            res.status(200).json({
                success: true,
                data: {
                    quizId: quiz._id,
                    title: quiz.title,
                    difficultyLevel: quiz.difficultyLevel,
                    questions
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
}
module.exports = adminController;
