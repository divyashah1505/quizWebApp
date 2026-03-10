const User = require("../models/user");
const crypto = require("crypto");
const client = require("../../utils/redisClient")
const verificationTemplate = require("../../utils/emailTemplate");
const { appString } = require("../../utils/appString")
const { storeUserToken, removeUserToken, getActiveToken, generateTokens, handleRefreshToken, success, error, upload } = require("../../utils/commonUtils")
const bcrypt = require("bcryptjs");

const { sendEmail } = require("../../utils/mailSender");

const userController = {
    registerUser: async (req, res) => {
        try {

            const { username, email, mobile, password, file } = req.body;

            const userExists = await User.findOne({ email });

            if (userExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email already registered"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const token = crypto.randomBytes(32).toString("hex");

            const userData = {
                username,
                email,
                mobile,
                password: hashedPassword,
                file
            };

            await client.set(
                `verify_user:${token}`,
                JSON.stringify(userData),
                {
                    EX: 86400   // 24 hours expiry
                }
            );

            const verifyURL = `http://localhost:3000/api/user/verify-email/${token}`;

            const html = verificationTemplate(verifyURL);

            await sendEmail(email, "Verify Your Email", html);

            return res.status(200).json({
                success: true,
                message: "Registration successful. Please verify your email."
            });
        } catch (error) {

            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    },


    verifyEmail: async (req, res) => {

        try {

            const { token } = req.params;

            const user = await User.findOne({
                emailVerificationToken: token
            });

            if (!user) {
                return res.status(400).send(appString.INVALIDEXPIREDLINK);
            }

            user.isVerifiedByEmail = 1;
            user.emailVerificationToken = null;

            await user.save();

            res.send(`<h2>Email Verified Successfully</h2> <p>You can now login.</p>`);

        } catch (error) {

            console.log(error);

            res.status(500).send(appString.SERVERERROR);

        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const rawContact = email || mobile || username;

            if (!rawContact || !password) return error(res, appString.Required_EmailPass, 400);
            const contact = rawContact.toString();

            const user = await User.findOne({
                $or: [{ email: contact }, { mobile: contact }, { username: contact }]
            });

            if (!user || !(await user.matchPassword(password))) {
                return error(res, appString.INVALID_CREDENTIALS, 401);
            }

            const tokens = await generateTokens(user);

            return success(res, {
                userId: user._id,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                ...tokens
            }, appString.LOGIN_SUCCESS);

        } catch (err) {
            return error(res, err.message || appString.LOGIN_FAILED, 500);
        }
    },

};
module.exports = userController;
