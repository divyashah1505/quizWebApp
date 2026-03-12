const mongoose = require("mongoose")
const withDrawRequestSchema = new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            reuired:true
        },
        points:{
            type:Number,
            required:true
        },
        amount:{
            type:Number
        },
        status:{
             type:Number, // 0 for pending 1 for accept 2nd for rejcetd
            default:0
        }
    },
    {timestamps:true}
)
module.exports = mongoose.model("withdrawRequest",withDrawRequestSchema)