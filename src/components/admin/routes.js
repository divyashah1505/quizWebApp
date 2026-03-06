const express = require("express");
const router = express.Router();
const { routeArray } = require("../../middleware");
const quizMangmentController = require("../admin/controller/quizManagementController")
const adminController = require("./controller/adminLoginController");
const quizController = require("../admin/controller/quizController")
const routes = [
  {
    path: "/registeradmin",
    method: "post",
    controller: adminController.register,
    isPublic: true,
  },
  {
    path: "/loginAdmin",
    method: "post",
    controller: adminController.login,
    isPublic: true,
  },
  
  {
    path: "/category",
    method: "post",
    controller: quizMangmentController.addCategory,
  },
  {
    path: "/list-categoriesdetails",
    method: "get",
    controller: quizMangmentController.listCategories,
  },
  {
    path: "/category/:id",
    method: "put",
    controller: quizMangmentController.updateCategory,
  },
  {
    path: "/category/:id",
    method: "delete",
    controller: quizMangmentController.deleteCategory,
  },
  {
    path: "/category/reactivate/:id",
    method: "put",
    controller: quizMangmentController.reactivateCategory,
  },
  {
    path:"/add-quiz",
    method:"post",
    controller:quizController.createQuiz
  },
  {
    path:"/update-quiz/:id",
    method:"put",
    controller:quizController.updateQuiz
  }
]
module.exports = routeArray(routes, router, true);
