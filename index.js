// Language: javascript
// Path: server\src\app.js
const app = require("./app");
const io = require("socket.io");
const port = process.env.PORT || 5000;

/* Imports Routes */
const userRouter = require("./routes/userRoute");
const coursesRouter = require("./routes/coursesRoute");
const gdriveRouter = require("./routes/gDrive.route");
const studentRouter = require("./routes/studentRoute");
const teacherRouter = require("./routes/teacherRoute");
const chatRouter = require("./routes/chatRoute");

/* Init Routes */
app.use("/api/users", userRouter);

/* courses */
app.use("/api/courses", coursesRouter);

app.use("/api/google-drive", gdriveRouter);

/* student route */
app.use("/api/student", studentRouter);

/* teacher route */
app.use("/api/teacher", teacherRouter);

/* chat route */
app.use("/api/chat", chatRouter);

/* Start Server */
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

/* Global Error Handlers and Route Validations */
app.use((req, res, next) => {
  res.status(404).send({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  const error = new Error("Not Found");
  if (req.headerSent) {
    return next(error);
  }
  res.status(404).json({
    message: error.message,
  });
});
process.on("unhandledRejection", (err, promise) => {
  if (err) {
    console.log(`Logged Error: ${err}`);
    app.close(() => process.exit(1));
  }
});

// /* socket.io connection */
const socketServer = io(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

socketServer.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData);
    socket.emit("connected");
  });

  socket.on("join-chat", (room) => {
    socket.join(room);
  });

  socket.on("new-message", (newMessageReceived) => {
    socket
      .in(newMessageReceived?.chat)
      .emit("message-received", newMessageReceived);
  });

  socket.on("join-notification", (room) => {
    socket.join(room);
  });

  socket.on("send-notification", (data) => {
    socket.to(data?.student).emit("received-notification", data);
    socket.to(data?.course).emit("received-notification", data);
  });
});
