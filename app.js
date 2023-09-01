const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
// const swaggerJsDoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");

require("dotenv").config();
require("colors");

// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Coursea Backend",
//       version: "1.0.0",
//     },
//     servers: [
//       {
//         api: "http://localhost:5000/",
//         // api: 'https://course-management-back-seven.vercel.app/'
//       },
//     ],
//   },
//   apis: [
//     "./routes/coursesRoute.js",
//     "./routes/gDrive.route.js",
//     "./routes/userRoute.js",
//   ],
// };

// const swaggerSpec = swaggerJsDoc(options);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* Apply Global Middle ware */
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.resolve("uploads")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

/* Database Connections */
const dbConnection = require("./utils/connectDB");
dbConnection();

/* Test Routes */
app.get("/", (req, res) => {
  // res.sendFile(__dirname + "/views/api.html");
  res.send("Welcome to course management server!");
});

module.exports = app;
