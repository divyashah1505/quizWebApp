const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            require:true
        },
        balance:{
            type:Number,
            default:0
        }
    }
)
module.exports = mongoose.model("wallet", walletSchema);