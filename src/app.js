const express = require("express");
const mongoose = require("mongoose");
const http = require("http")
const path = require("path");
const cors = require("cors");
const config = require("../config/devlopment.json");
const adminRouter = require("../src/components/admin/routes");
const { appString } = require("./components/utils/appString");
const router = require("../src/components/user/index");
const {initSocket , sendNotificationToUser} = require("../src/components/user/controller/socketController")

const client = require("../src/components/utils/redisClient")
const app = express();
app.set("view engine","ejs");
console.log(app.get("view engine"));
app.set("views",path.resolve(__dirname,"../src/views"))
const server = http.createServer(app);
initSocket(server)
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/api/admins", adminRouter);
app.use("/api/users", router);
// cronwithDrawCron();

mongoose.connect(config.DB_URL)
    .then(() => console.log(" MongoDB Connected"))
    .catch((err) => console.error(" DB Error:", err));

const PORT = 3000;
server.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));