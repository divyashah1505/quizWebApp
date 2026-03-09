const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const { createClient } = require("redis");
const client = createClient();
const config = require("../../../config/devlopment.json");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadDir = path.join(__dirname, "../../../uploads/IMG");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error(appString.img_ERR), false);
  },
});
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect().then(() => console.log("Redis Connected"));
const success = (res, data = {}, message, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });
const error = (res, message, statusCode = 422) =>
  res.status(statusCode).json({ success: false, message });
const storeUserToken = async (userId, accessToken, refreshToken) => {
  await client.set(`auth:accessToken:${userId}`, accessToken, {
    expiresIn: "1d",
  });
  await client.set(`auth:refreshToken:${userId}`, refreshToken, {
    expiresIn: "1d",
  });
};
const removeUserToken = async (userId) => {
  if (!userId) return;
  await client.del(`auth:accessToken:${userId}`);
  await client.del(`auth:refreshToken:${userId}`);
};
const getActiveToken = async (userId) => {
  return await client.get(`auth:accessToken:${userId}`);
};
const generateTokens = async (user) => {
  if (!config.ACCESS_SECRET || !config.REFRESH_SECRET)
    throw new Error(appString.jWTNOT_DEFINED);

  const payload = { id: user._id || user, role: user.role || "user" };

  const accessToken = jwt.sign(payload, config.ACCESS_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(payload, config.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  await storeUserToken(payload.id.toString(), accessToken, refreshToken);

  return { accessToken, refreshToken };
};
const handleRefreshToken = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const refreshToken = authHeader?.split(" ")[1];

    if (!refreshToken) {
      return console.error(401).json({ success: false, message: "Token missing" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET || config.REFRESH_SECRET,
    );

    const actualId =
      typeof decoded.id === "object" ? decoded.id.id : decoded.id;
    const actualRole =
      typeof decoded.id === "object" ? decoded.id.role : decoded.role;

    const newTokens = await generateTokens({
      id: actualId,
      role: actualRole,
    });

    return console.success(200).json({ success: true, ...newTokens });
  } catch (err) {
    console.error("Refresh Token Error:", err.message);
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

const calculateQuestionPoints = (difficultyLevel, timeTaken) => {

  let basePoints = 0;

  if (difficultyLevel == 0) basePoints = 10;
  if (difficultyLevel == 1) basePoints = 30;
  if (difficultyLevel == 2) basePoints = 50;

  let finalPoints = basePoints;

  if (timeTaken >= 10 && timeTaken <= 20) {
    finalPoints = basePoints;
  }
  else if (timeTaken > 20 && timeTaken <= 50) {
    finalPoints = basePoints * 0.5;
  }
  else if (timeTaken > 50) {
    finalPoints = basePoints * 0.3;
  }

  return finalPoints;
};

const updateUserStreak = (user) => {

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streakBonus = 0;

  if (user.lastActiveDate) {

    const lastDate = new Date(user.lastActiveDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = today - lastDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      user.streakCount += 1;
    }
    else if (diffDays > 1) {
      user.streakCount = 1;
    }

  } else {
    user.streakCount = 1;
  }

  user.lastActiveDate = today;

  if (user.streakCount % 5 === 0) {
    streakBonus = 50;
  }

  return { user, streakBonus };
};





module.exports = { storeUserToken, removeUserToken, getActiveToken, generateTokens, handleRefreshToken, success, error, upload,calculateQuestionPoints,updateUserStreak }