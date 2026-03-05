const userController = require("../user/controller/userController");
const { handleRefreshToken } = require("../../components/utils/commonUtils");
const { appString } = require("../../../src/components/utils/appString")
module.exports = [
    {
        path: "/register",
        method: "post",
        controller: userController.registerUser,
        isPublic: true,
    },
    {
        path: "/verify-mail/:token",
        method: "get",
        controller: userController.verifyEmail,
        isPublic: true

    },
     {
        path: "/loginUser",
        method: "post",
        controller: userController.login,
        isPublic: true

    }
]