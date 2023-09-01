const { findUserByIdService } = require("../services/userService");
const StudentGuard = async (req, res, next) => {
  const { _id } = req.user;
  const user = await findUserByIdService(_id);
  if (user.role === "student") {
    next();
  } else {
    res.status(401).json({
      status: "error",
      message: "You are not authorized to view this resource",
    });
  }
};
module.exports = StudentGuard;
