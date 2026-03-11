const User = require("../models/user");
const crypto = require("crypto");
const client = require("../../utils/redisClient")
const verificationTemplate = require("../../utils/emailTemplate");
const verificationLoginTemplate = require("../../utils/loginEmailTemplate");
const { appString } = require("../../utils/appString")
const { storeUserToken, removeUserToken, getActiveToken, generateTokens, handleRefreshToken, success, error, upload } = require("../../utils/commonUtils")
const bcrypt = require("bcryptjs");
const { initSocket, sendNotificationToUser } = require("../controller/socketController")
const { sendEmail } = require("../../utils/mailSender");
const { log } = require("console");
const user = require("../models/user");

const userController = {
    registerUser: async (req, res) => {
        try {
            const { username, email, mobile, password, file } = req.body;
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ success: false, message: appString.EMAILALREDYREGISTERED });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const token = crypto.randomBytes(32).toString('hex');
            const userData = { username, email, mobile, password, file };

            await client.set(`verify_user:${token}`, JSON.stringify(userData), { EX: 86400 });

            const verifyURL = `http://localhost:3000/api/users/verify-mail/${token}`;
            const html = verificationTemplate(verifyURL);
            await sendEmail(email, 'Verify Your Email', html);


            return res.status(200).json({ success: true, message: appString.USERREGISTRATIONSUCCESSFULL });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: appString.SERVERERROR });
        }
    },


    verifyEmail: async (req, res) => {
        try {
            console.log("hit");
            const { token } = req.params;

            const redisData = await client.get(`verify_user:${token}`);
            if (!redisData) {
                return res.render("verificationExpired");
            }

            const userData = JSON.parse(redisData);

            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                return res.render("alreadyVerified");
            }

            const newUser = new User(userData);
            await newUser.save();

            await client.del(`verify_user:${token}`);

            const { accessToken, refreshToken } = await generateTokens(newUser)
            sendNotificationToUser(userData.email, 'User Registered', {
                message: appString.USERREGISTRATIONSUCCESSFULLVERIFIED,
                tokens: {
                    accessToken,
                    refreshToken
                },
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username
                }


            });

            return res.render("verificationSuccess");

        } catch (error) {
            console.error("Verification Error:", error);
            return res.render("verificationExpired");
        }
    },

    login: async (req, res) => {
        try {

            const { email, password } = req.body;

            if (!email) {
                return error(res, "Email is required", 400);
            }

            const contact = email.toString().trim();

            const user = await User.findOne({ email: contact });

            if (!user) {
                return error(res, appString.USERNOTFOUND, 404);
            }

            if (!password) {

                const loginVerifyToken = crypto.randomBytes(32).toString("hex");

                user.loginVerifyToken = loginVerifyToken;
                await user.save();

                const verificationUrl = `http://localhost:3000/api/users/verify-login?token=${loginVerifyToken}`;

                const html = verificationLoginTemplate(verificationUrl);

                await sendEmail(user.email, "Login Verification", html);

                return success(res, null, appString.VERIFICATIONMAILSEND);
            }

            if (user.isLoginVeried !== 1) {
                return error(res, appString.LOGINFIRSTFROMMAIL, 401);
            }

            const isMatch = await user.matchPassword(password);

            if (!isMatch) {
                return error(res, appString.INVALIDPASSWORD, 401);
            }

            const { accessToken, refreshToken } = await generateTokens(user);

            return success(res, {
                userId: user._id,
                username: user.username,
                accessToken,
                refreshToken
            }, appString.LOGINSUCCESS);

        } catch (err) {
            console.error(err);
            return error(res, appString.LOGINFAILED, 500);
        }
    },
    verifyLogin: async (req, res) => {
        try {

            const { token } = req.query;

            if (!token) {
                return res.render("verificationExpired");
            }

            const user = await User.findOne({ loginVerifyToken: token });

            if (!user) {
                return res.render("verificationExpired");
            }

            user.loginVerifyToken = null;
            user.isLoginVeried = 1;

            await user.save();
            sendNotificationToUser(user._id.toString(), "Login Verified", { message: appString.LOGINVERIFICATIONSUCCESSFULL })
            return res.render("loginSuccess");

        } catch (err) {
            console.error(err);
            return res.render("verificationExpired");
        }
    },
    logout: async (req, res) => {
        try {
            const userId = req?.user?.id;
            const user = await User.findById(userId);
            if (!user) {
                return error(res, appString.USERNOTFOUND, 400);
            }
            user.isLoginVeried = 0;
            await user.save()
            await removeUserToken(userId);
            return success(res, {}, appString.LOGOUT_SUCCESS);
        } catch (err) {
            return error(res, appString.LOGOUT_FAILED, 500);
        }
    },


};
module.exports = userController;
