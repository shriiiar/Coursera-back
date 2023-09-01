const { findUserByIdService } = require("../services/userService");

const TeacherGuard = async (req, res, next) => {
  const { _id } = req.user;
  const user = await findUserByIdService(_id);
  if (user.role === "teacher") {
    next();
  } else {
    res.status(401).json({
      status: "error",
      message: "You are not authorized to view this resource",
    });
  }
};
module.exports = TeacherGuard;
