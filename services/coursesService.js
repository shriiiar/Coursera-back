const Courses = require("../models/coursesModel");

exports.findCourseByIdService = async (id, courseId) => {
  return await Courses.findOne({
    $and: [{ _id: courseId }, { user: id }],
  });
};

exports.findCourseByNameService = async (id, courseName) => {
  return await Courses.findOne({
    $and: [{ courseName: courseName }, { user: id }],
  });
};
