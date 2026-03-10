const User = require("../models/user");
const crypto = require("crypto");
const client = require("../../utils/redisClient")
const verificationTemplate = require("../../utils/emailTemplate");
const { appString } = require("../../utils/appString")
const { storeUserToken, removeUserToken, getActiveToken, generateTokens, handleRefreshToken, success, error, upload } = require("../../utils/commonUtils")
const bcrypt = require("bcryptjs");
const { initSocket,sendNotificationToUser} = require("../controller/socketController")
const { sendEmail } = require("../../utils/mailSender");

const userController = {
    registerUser: async (req, res) => {
        try {

            const { username, email, mobile, password, file } = req.body;

            const userExists = await User.findOne({ email });

            if (userExists) {
                return res.status(400).json({
                    success: false,
                    message: appString.EMAILALREDYREGISTERED
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
                    EX: 86400
                }
            );

            const verifyURL = `http://localhost:3000/api/users/verify-mail/${token}`;

            const html = verificationTemplate(verifyURL);

            await sendEmail(email, "Verify Your Email", html);

            return res.status(200).json({
                success: true,
                message: appString.USERREGISTRATIONSUCCESSFULL
            });
            

        } catch (error) {

            console.log(error);

            return res.status(500).json({
                success: false,
                message: appString.SERVERERROR
            });
        }
    },


    verifyEmail: async (req, res) => {
        try {
            console.log("hit");
            
            const { token } = req.params;

            const redisData = await client.get(`verify_user:${token}`);

            if (!redisData) {
                return res.render("verificaionExpired");
            }

            const userData = JSON.parse(redisData);

            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                return res.render("alredyVerified");
            }

            const newUser = new User(userData);

            await newUser.save();

            await client.del(`verify_user:${token}`);

            return res.render("verificationSuccess");

        } catch (error) {

            console.log(error);

            return res.render("verificationExpired");
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
