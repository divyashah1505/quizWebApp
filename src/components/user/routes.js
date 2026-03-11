const userController = require("../user/controller/userController");
const withdrawController = require("../user/controller/withdrawRequestController")
const { handleRefreshToken } = require("../../components/utils/commonUtils");
const { appString } = require("../../../src/components/utils/appString")
const quizController = require("../user/controller/quizController")
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

    },
    {
        path:"/verify-login",
        method:"get",
         controller: userController.verifyLogin,
         isPublic: true
    },
    {
        path: "/logout",
        method: "post",
        controller: userController.logout,
    },
    {
        path:"/getQuizByLevel/:level",
        method:"get",
        controller:quizController.getQuizByLevel
    },
    {
        path:"/quiz/Submit",
        method:"post",
        controller:quizController.submitQuiz
    },
    {
        path:"/withdraw/request",
        method:"post",
        controller:withdrawController.createWithDrawRequest
    },
    {
        path:"/userListHscoreToL",
        method:"get",
        controller:userController.userList
    }
   
]