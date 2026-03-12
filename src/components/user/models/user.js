const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { appString } = require("../../utils/appString");
const Quiz = require("../../admin/model/quiz")
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: [true, appString.USERNAME_REQUIRED],
            trim: true,
            minlength: [6, "Username must be at least 6 characters long"],
            maxlength: [20, appString.LIMIT],
        },
        email: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            lowercase: true,
            match: [/.+@.+..+/, "Please enter a valid email address"],
        },
        mobile: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"],
        },
        file: { type: String },
        status: { type: Number, enum: [0, 1], default: 1 },
        isVerifiedByEmail: { type: Number, enum: [0, 1], default: 0 },
        loginVerifyToken: { 
            type: String,
            default:null
         },
         isLoginVeried:{
            type :Number, //1 for verified 0 for unverified
            default:0
        },
        totalPoints: { type: Number, default: 0 },
        streakCount: { type: Number, default: 0 },
        isBanned: { type: Number, default: 0 },
        deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        attemptedQuizes: [{ type: mongoose.Schema.Types.ObjectId, ref: "quiz" }]
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
