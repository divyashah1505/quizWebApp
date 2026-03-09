const withdrawRequest = require("../models/withDrawRequest")
// const User = require("../models/user");
const user = require("../models/user");
const {convertPointsToRupees,success,error} = require("../../utils/commonUtils")
const { appString } = require("../../utils/appString");
const withdrawController = {
    createWithDrawRequest: async (req, res) => {
        try {
            const userId = req.user.id;
            const { points } = req.body;
            const User = await user.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: appString.USERNOTFOUND
                })
            }
            if (points > user.totalPoints) {
                return res.status(404).json({
                    success: false,
                    message: appString.INSUFFICIANTPOINTS
                })
            }
             const amount = convertPointsToRupees(points)
            const Request = await withdrawRequest.create({
                userId,
                points
            });
            User.totalPoints -= points
            await User.save();
            res.json({
                success: true,
                message: appString.WITHDRAWREQUESTSUBMITED
            })

        } catch (error) {
            console.log(("this is eror", error));

            res.status(500).json({
                success: false,
                message: appString.SERVERERROR
            });

        }
    }
}
module.exports = withdrawController