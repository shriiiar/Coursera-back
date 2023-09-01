const bcrypt = require("bcrypt");
const {
  createUserService,
  findUserByEmailService,
  updateUserService,
  findAllUsersService,
  updateTeacherService,
  deleteTeacherService,
  changePasswordService,
  emailChangeService,
} = require("../services/userService");
const generateToken = require("../utils/GenerateToken");
const User = require("../models/userModel");
const Courses = require("../models/coursesModel");

/* register user */
exports.registerUser = async (req, res) => {
  try {
    const { email } = req.body;
    // check if user already exists
    const isUserExists = await findUserByEmailService(email);
    if (isUserExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists by this " + email,
      });
    }
    // create new user
    const user = await createUserService(req.body);
    const { password: pwd, ...userWithoutPassword } = user.toObject();
    // return user
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: userWithoutPassword,
        token: generateToken(user),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error" + err.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check if user exists
    const user = await findUserByEmailService(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    // check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    // return user
    const { password: pwd, ...userWithoutPassword } = user.toObject();
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        user: userWithoutPassword,
        token: generateToken(user),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error" + err.message,
    });
  }
};

// get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await findUserByEmailService(req.user?.email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    // return user
    const { password: pwd, ...userWithoutPassword } = user.toObject();
    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error" + err.message,
    });
  }
};

// update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    console.log(req.user, 113);
    const user = await findUserByEmailService(req.user?.email);
    console.log(user, 115);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    // update user
    await updateUserService(req.user?.email, req.body);
    // return user
    const { password: pwd, ...userWithoutPassword } = user.toObject();
    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error" + err.message,
    });
  }
};

// logout
exports.logoutUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error" + err.message,
    });
  }
};

// get all students
exports.getAllStudents = async (req, res) => {
  try {
    const users = await User.find({
      role: "student",
      isSuspended: false,
    });

    res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: students,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error" + err.message,
    });
  }
};

// get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await findAllUsersService(role);
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error" + err.message,
    });
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await findUserByEmailService(req.user?.email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    // delete user
    await user.remove();
    // return user
    const { password: pwd, ...userWithoutPassword } = user.toObject();
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error" + err.message,
    });
  }
};

// get user by id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate({
        path: "courses",
      });

    const courses = await Courses.find({
      user: req.user?._id,
      students: { $in: [user._id] },
    });

    user.courses = courses;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    // return user
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error" + err.message,
    });
  }
};

// update teacher

exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateTeacherService(id, req.body);
    if (!result.modifiedCount) {
      return res.status(400).send({
        success: false,
        error: "couldn't update the teacher with this id",
      });
    }
    res.status(200).send({
      success: true,
      message: "Successfully update the teacher",
      data: result,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "could't update the teacher info",
      error: error.message,
    });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteTeacherService(id);

    if (!result) {
      return res.status(400).send({
        success: false,
        error: "Couldn't delete the teacher",
      });
    }

    res.status(200).send({
      success: true,
      message: "Teacher delete successfully",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "could't delete the teacher",
      error: error.message,
    });
  }
};

exports.passwordChange = async (req, res) => {
  try {
    const { ...passwordData } = req.body;
    await changePasswordService(passwordData);
    res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "could't change the password",
      error: error.message,
    });
  }
};

exports.emailChange = async (req, res) => {
  try {
    const { ...emailData } = req.body;
    await emailChangeService(emailData);
    res.status(200).send({
      success: true,
      message: "Email changed successfully",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "could't change the email",
      error: error.message,
    });
  }
};
