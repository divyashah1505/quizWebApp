const User = require("../../user/models/user");
const appString = require("../../utils/appString");
const { error, success } = require("../../utils/commonUtils");

const banedUnbanedFromAdminController = {

banUnbanUser: async (req, res) => {

    try {

        const { userId } = req.params;
        const { isBanned } = req.body; // 1 = ban , false = 0

        const user = await User.findById(userId);

        if (!user) {
            return error(res,{
                success: false,
                message: appString.USERNOTFOUND
            });
        }

        user.isBanned = isBanned;

        await user.save();

        return success(res,{
            success: true,
            message: isBanned ? appString.USERBANNEDSUCCESS : appString.USERUNBANEDNOTSUCCESS,
            user
        });

    } catch (error) {

        console.log(error);

        return error(res,{
            success: false,
            message: appString.SERVERERROR
        });

    }
}
};

module.exports = banedUnbanedFromAdminController;