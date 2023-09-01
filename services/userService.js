const User = require("../models/userModel");
const bcrypt = require("bcrypt");
exports.createUserService = async (data) => {
  const { name, email, password, role, specialist, ...otherData } = data;
  // make password hashed
  const hashedPassword = await bcrypt.hash(password, 10);
  // create new user
  const user = await User.create({
    name,
    email,
    role,
    specialist,
    password: hashedPassword,
    ...otherData,
  });
  return user;
};

exports.findUserByEmailService = async (email) => {
  return await User.findOne({
    email: email,
  });
};

exports.findUserByIdService = async (query) => {
  return await User.findById(query);
};

exports.updateUserService = async (email, data) => {
  console.log(email, data, 30);
  const result = await User.findOneAndUpdate({ email }, data, {
    new: true,
    // runValidators: true,
  });
  console.log(result);
  return result;
};

exports.findAllUsersService = async (role) => {
  let query = {};
  if (role) {
    query = { role: role };
  } else {
    query = {};
  }

  return await User.find(query).select("-password").populate("courses");
};

exports.updateTeacherService = async (id, data) => {
  const result = await User.updateOne({ _id: id }, { $set: data });
  return result;
};

exports.deleteTeacherService = async (id) => {
  const result = await User.findByIdAndDelete({ _id: id });
  return result;
};

exports.changePasswordService = async (passwordData) => {
  const { userId, oldPassword, newPassword } = passwordData;

  // checking if user exists or not
  const isUserExist = await User.findOne({ _id: userId }).select("+password");
  if (!isUserExist) {
    throw new Error("User not found");
  }
  // checking old password
  if (
    isUserExist.password &&
    !(await bcrypt.compare(oldPassword, isUserExist.password))
  ) {
    throw new Error("Old password is incorrect");
  }
  isUserExist.password = await bcrypt.hash(newPassword, 10);
  isUserExist.save();
};

exports.emailChangeService = async (emailData) => {
  const { newEmail, oldEmail } = emailData;
  const isUserExistWithOldEmail = await User.findOne({ email: oldEmail });
  if (!isUserExistWithOldEmail) {
    throw new Error("User not found");
  }
  const isUserExistWithNewEmail = await User.findOne({ email: newEmail });
  if (isUserExistWithNewEmail) {
    throw new Error("Email already exists");
  }
  isUserExistWithOldEmail.email = await newEmail;
  isUserExistWithOldEmail.save();
};
