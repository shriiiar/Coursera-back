const router = require("express").Router();

// import the user controller
const userController = require("../controllers/userController");

// import the auth middleware
const AuthGuard = require("../middlewares/AuthGuard");
const StudentGuard = require("../middlewares/StudentGuard");
const TeacherGuard = require("../middlewares/TeacherGuard");

// @routes   GET api/register
// @desc     Register a user
// @access   Public
router.post("/register", userController.registerUser);

// @route Get api/login
// @desc Login a user
// @access Public
router.post("/login", userController.loginUser);

// @route Get api/profile
// @desc Get user profile
// @access Private
router.get("/profile", AuthGuard, userController.getUserProfile);

// @route PATCH api/profile
// @desc Update user profile
// @access Private
router.patch("/profile", AuthGuard, userController.updateUserProfile);

// @route Get api/logout
// @desc Logout a user
// @access Private
router.get("/logout", AuthGuard, userController.logoutUser);

// @route Get api/users
// @desc Get all users
// @access Private
router.get("/users", AuthGuard, userController.getAllUsers);

// @route GET api/users/students
// @desc Get all students
// @access Private
router.get(
  "/users/students",
  AuthGuard,
  TeacherGuard,
  userController.getAllStudents
);

// @route GET api/users/:id
// @desc Get a user
// @access Private
router.get("/user/:id", AuthGuard, userController.getUserById);

// @route Delete api/users/:id
// @desc Delete a user
// @access Private
router.delete("/users/:id", AuthGuard, userController.deleteUser);

router.patch("/teacher/:id", AuthGuard, userController.updateTeacher);
router.delete("/teacher/:id", AuthGuard, userController.deleteTeacher);
router.patch("/change-password", AuthGuard, userController.passwordChange)
router.patch("/change-email", AuthGuard, userController.emailChange)


// export
module.exports = router;
