const User = require("../models/user");
const crypto = require("crypto");
const client = require("../../utils/redisClient")
const verificationTemplate = require("../../utils/emailTemplate");
const { appString } = require("../../utils/appString")
const { storeUserToken, removeUserToken, getActiveToken, generateTokens, handleRefreshToken, success, error, upload } = require("../../utils/commonUtils")
const bcrypt = require("bcryptjs");
const { initSocket, sendNotificationToUser } = require("../controller/socketController")
const { sendEmail } = require("../../utils/mailSender");
const { log } = require("console");

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
            const userData = { username, email, mobile, password: hashedPassword, file };

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
    logout: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];

            if (!token) {
                return error(res, "No token provided", 400);
            }

            await removeUserToken(req.user.id, token);
            return success(res, {}, appString.LOGOUT_SUCCESS);
        } catch (err) {
            return error(res, appString.LOGOUT_FAILED, 500);
        }
    },
    login: async (req, res) => {
        try {
            console.log("hi")
            const { email, password } = req.body;
            console.log(req.body)
            const rawContact = email || password
            console.log(rawContact)
            if (!rawContact || !password) {
                return error(res, appString.Required_EmailPass, 400);
            }

            const contact = rawContact.toString().trim();

            const user = await User.findOne({
                $or: [
                    { email: contact },
                    {password:contact}
                ]
            });

            if (!user || !(await user.matchPassword(password))) {
                return error(res, "Invalid Login Credentials", 401);
            }
            
            const loginVerifyToken = crypto.randomBytes(32).toString("hex");

            user.loginVerifyToken = loginVerifyToken;
            await user.save();

            const verificationUrl = `http://localhost:3000/api/users/verify-login?token=${loginVerifyToken}`;

            const html = `<h2>Login Verification</h2><p>Please click below button to verify your login</p><a href="${verificationUrl}"><button style="padding:10px 20px;background:#4CAF50;color:white;border:none;">Verify Login</button></a>`;

            await sendEmail(user.email, "Login Verification", html);

            return success(res, null, "Please check your email to verify login.");
        } catch (err) {
            console.error(err);
            return error(res, err.message || "Login Failed", 500);
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

            // Generate JWT tokens
            const { accessToken, refreshToken } = await generateTokens(user);

            // Remove login verification token
            user.loginVerifyToken = null;
            await user.save();

            // Render success page
            return res.render("loginSuccess", {
                accessToken,
                refreshToken,
                username: user.username
            });
        } catch (err) {
            console.error(err);
            return res.render("verificationExpired");
        }
    }


};
module.exports = userController;
