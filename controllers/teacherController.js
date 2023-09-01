const Assignment = require("../models/assignmentSchema");
const CompletedAssignment = require("../models/completedAssignment");
const Notification = require("../models/notificationSchema");
const Courses = require("../models/coursesModel");
const Milestones = require("../models/milestonesModel");
const Modules = require("../models/modulesModel");
const User = require("../models/userModel");
const Videos = require("../models/videosModel");
const Marks = require("../models/markSchema");
const { findCourseByNameService } = require("../services/coursesService");
const mongoose = require("mongoose");
const Mark = require("../models/markSchema");
const Quizzes = require("../models/quizzesModel");
const QuizMark = require("../models/quizMarkSchema");

/* create course */
exports.createCourse = async (req, res) => {
  try {
    const isCourseAlready = await findCourseByNameService(
      req.user?._id,
      req.body.courseName
    );

    if (isCourseAlready) {
      return res.status(400).send({
        success: false,
        message: "course already exist",
      });
    }
    const course = new Courses({
      user: req.user?._id,
      courseName: req.body.courseName,
      description: req.body.description,
      ...req.body,
    });

    await course.save();
    const user = await User.findById(req.user?._id);
    user.courses.push(course._id);
    await user.save();
    res.status(200).send({
      success: true,
      message: "course created successfully",
      course,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* edit course */
exports.editCourse = async (req, res) => {
  try {
    const course = await Courses.findById(req.params.courseId);
    if (!course) {
      return res.status(400).send({
        success: false,
        message: "course not found",
      });
    }
    if (course.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    const editCourse = await Courses.findByIdAndUpdate(
      req.params.courseId,
      {
        $set: {
          ...req.body,
        },
      },
      { new: true }
    );
    if (!editCourse) {
      return res.status(400).send({
        success: false,
        message: "course not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "course updated successfully",
      editCourse,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* delete course */
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Courses.findById(req.params.id);
    if (!course) {
      return res.status(400).send({
        success: false,
        message: "course not found",
      });
    }
    if (course.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    const milestones = await Milestones.find({ courseId: req.params.id });
    milestones.forEach(async (milestone) => {
      const modules = await Modules.find({ milestoneId: milestone._id });
      modules.forEach(async (module) => {
        const videos = await Videos.find({ moduleId: module._id });
        videos.forEach(async (video) => {
          /* delete video */
          video.remove();
        });
        /* delete module */
        module.remove();
      });
      /* delete milestone */
      milestone.remove();
    });

    // remove course id from user
    const user = await User.findById(req.user?._id);
    user.courses = user.courses.filter((id) => id.toString() !== course?._id);
    await user.save();

    const students = await User.find({ courses: { $in: course?._id } });
    students?.forEach(async (item) => {
      const student = await User.findOne(item?._id);
      student.courses = student.courses.filter(
        (id) => id.toString() !== course?._id
      );
      await student.save();
    });

    /* delete course */
    course.remove();
    res.status(200).send({
      success: true,
      message: "course deleted successfully",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* get courses by teacher */
exports.getTeacherCourses = async (req, res) => {
  try {
    const courses = await Courses.find({
      user: req.user?._id,
      role: "teacher",
    });
    res.status(200).send({
      success: true,
      message: "courses fetched successfully",
      courses,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* add milestone to course */
exports.addMilestone = async (req, res) => {
  try {
    const course = await Courses.findById(req.params.courseId);
    if (!course) {
      return res.status(400).send({
        success: false,
        message: "course not found",
      });
    }
    if (course.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    const milestoneData = {
      user: req.user?._id,
      courseId: req.params.courseId,
      name: req.body.name,
      totalTimes: req.body.totalTimes,
    };

    const milestone = await Milestones.create(milestoneData);
    course.milestones.push(milestone._id);
    await course.save();
    res.status(200).send({
      success: true,
      message: "milestone added successfully",
      milestone,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* update milestone */
exports.updateMilestone = async (req, res) => {
  try {
    const milestone = await Milestones.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });
    if (!milestone) {
      return res.status(400).send({
        success: false,
        message: "milestone not found",
      });
    }
    if (milestone.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    const updatedMilestone = await Milestones.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "milestone updated successfully",
      milestone: updatedMilestone,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* delete milestone */
exports.deleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestones.findById(req.params.id);
    if (!milestone) {
      return res.status(400).send({
        success: false,
        message: "milestone not found",
      });
    }
    if (milestone.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    const modules = await Modules.find({ milestoneId: req.params.id });
    modules.forEach(async (module) => {
      const videos = await Videos.find({ moduleId: module._id });
      videos.forEach(async (video) => {
        /* delete video */
        video.remove();
      });
      /* delete module */
      module.remove();
    });

    // remove milestone id from course
    const course = await Courses.findById(milestone.courseId);
    course.milestones = course.milestones.filter(
      (id) => id.toString() !== milestone._id.toString()
    );
    await course.save();

    /* delete milestone */
    milestone.remove();
    res.status(200).send({
      success: true,
      message: "milestone deleted successfully",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* get milestone by course id */
exports.getMilestonesByCourse = async (req, res) => {
  try {
    const course = await Courses.findById(req.params.id);
    if (!course) {
      return res.status(400).send({
        success: false,
        message: "course not found",
      });
    }
    if (course.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    const milestones = await Milestones.find({
      courseId: req.params.id,
      // user: req.user?._id,
    });
    res.status(200).send({
      success: true,
      message: "milestones fetched successfully",
      milestones,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* add module */
exports.addModule = async (req, res) => {
  try {
    const milestone = await Milestones.findById(req.params.id);
    if (!milestone) {
      return res.status(400).send({
        success: false,
        message: "milestone not found",
      });
    }
    if (milestone.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    const moduleData = {
      user: req.user?._id,
      milestoneId: req.params.id,
      name: req.body.name,
      totalTimes: req.body.totalTimes,
    };
    const course = await Courses.findOne({
      milestones: { $in: req.params.id },
    });
    const module = await Modules.create({
      courseId: course?._id,
      ...moduleData,
    });
    milestone.modules.push(module._id);
    course.modules.push(module?._id);
    await milestone.save();
    await course.save();
    res.status(200).send({
      success: true,
      message: "module added successfully",
      module,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* update module */
exports.updateModule = async (req, res) => {
  try {
    const module = await Modules.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });
    if (!module) {
      return res.status(400).send({
        success: false,
        message: "module not found",
      });
    }
    if (module.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    const updatedModule = await Modules.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "module updated successfully",
      module: updatedModule,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* delete module */
exports.deleteModule = async (req, res) => {
  try {
    const module = await Modules.findById(req.params.id);
    if (!module) {
      return res.status(400).send({
        success: false,
        message: "module not found",
      });
    }
    if (module.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    const videos = await Videos.find({ moduleId: req.params.id });
    videos.forEach(async (video) => {
      /* delete video */
      video.remove();
    });

    // remove modules id from course
    const course = await Courses.findById(module.courseId);
    course.modules = course.modules.filter(
      (id) => id.toString() !== module._id.toString()
    );
    await course.save();

    // remove modules id from milestone
    const milestone = await Milestones.findById(module.milestoneId);
    milestone.modules = milestone.modules.filter(
      (id) => id.toString() !== module._id.toString()
    );
    await milestone.save();

    /* delete module */
    module.remove();

    res.status(200).send({
      success: true,
      message: "module deleted successfully",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* get modules by milestone id */
exports.getModulesByMilestone = async (req, res) => {
  try {
    const milestone = await Milestones.findById(req.params.id);
    if (!milestone) {
      return res.status(400).send({
        success: false,
        message: "milestone not found",
      });
    }

    if (milestone.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    const modules = await Modules.find({
      milestoneId: req.params.id,
      // user: req.user?._id,
    });
    res.status(200).send({
      success: true,
      message: "modules fetched successfully",
      modules,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* add video */
exports.addVideo = async (req, res) => {
  try {
    const module = await Modules.findById(req.params.id);
    if (!module) {
      return res.status(400).send({
        success: false,
        message: "module not found",
      });
    }
    if (module?.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }
    const videoData = {
      user: req.user?._id,
      courseId: module?.courseId,
      moduleId: req.params.id,
      ...req.body,
    };
    const course = await Courses.findById(module?.courseId);
    const video = await Videos.create(videoData);
    module?.videos.push(video._id);
    course?.videos.push(video?._id);
    await module.save();
    await course.save();
    res.status(200).send({
      success: true,
      message: "video added successfully",
      video,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* get videos by module id */
exports.getVideosByModule = async (req, res) => {
  try {
    const module = await Modules.findById(req.params.id);
    if (!module) {
      return res.status(400).send({
        success: false,
        message: "module not found",
      });
    }
    if (module.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }
    const videos = await Videos.find({
      moduleId: req.params.id,
      user: req.user?._id,
    });
    res.status(200).send({
      success: true,
      data: videos,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* update video */
exports.updateVideo = async (req, res) => {
  try {
    const video = await Videos.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });
    if (!video) {
      return res.status(400).send({
        success: false,
        message: "video not found",
      });
    }
    if (video.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    const updatedVideo = await Videos.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "video updated successfully",
      video: updatedVideo,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* delete video */
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Videos.findById(req.params.id);
    if (!video) {
      return res.status(400).send({
        success: false,
        message: "video not found",
      });
    }
    if (video.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    const module = await Modules.findById(video.moduleId);
    module.videos = module.videos.filter(
      (id) => id.toString() !== video._id.toString()
    );
    await module.save();

    const course = await Courses.findById(video.courseId);
    course.videos = course.videos.filter(
      (id) => id.toString() !== video._id.toString()
    );
    await course.save();

    video.remove();

    res.status(200).send({
      success: true,
      message: "video deleted successfully",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* give access to the student to the course by teacher */
exports.getAccessToCourse = async (req, res) => {
  try {
    const course = await Courses.findById(req.params.id);
    if (!course) {
      return res.status(400).send({
        success: false,
        message: "course not found",
      });
    }
    if (course.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    if (!req.body?.multiple) {
      const student = await User.findOne({
        _id: req.body.students,
        role: "student",
      });
      if (!student) {
        return res.status(400).send({
          success: false,
          message: "student not found",
        });
      }

      // if already given access
      if (student.courses.includes(req.params.id)) {
        return res.status(400).send({
          success: false,
          message: "already given access",
        });
      }

      const updatedCourse = await Courses.findByIdAndUpdate(
        req.params.id,
        { $push: { students: req.body.students } },
        { new: true }
      );

      student.courses.push(req.params.id);
      await student.save();
      res.status(200).send({
        success: true,
        message: "access given successfully",
        updatedCourse,
      });
    } else {
      req.body.students.forEach(async (studentId) => {
        const student = await User.findOne({
          _id: studentId,
          role: "student",
        });
        await Courses.findByIdAndUpdate(
          req.params.id,
          { $push: { students: studentId } },
          { new: true }
        );
        student.courses.push(req.params.id);
        await student.save();
      });

      res.status(200).send({
        success: true,
        message: "access given successfully to all the students",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

// remove student from course
exports.removeStudentFromCourse = async (req, res) => {
  try {
    const course = await Courses.findById(req.params.courseId);
    const student = await User.findById(req.params.studentId);
    if (!course || !student) {
      return res.status(400).send({
        success: false,
        message: "course or student not found",
      });
    }

    const index = course.students.indexOf(req.params.studentId);
    if (index > -1) {
      course.students.splice(index, 1);
    }

    const index2 = student.courses.indexOf(req.params.courseId);
    if (index2 > -1) {
      student.courses.splice(index2, 1);
    }

    await course.save();
    await student.save();

    res.status(200).send({
      success: true,
      message: "student removed successfully",
      course,
      student,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
      err,
    });
  }
};

// get assignment by id
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(400).send({
        success: false,
        message: "assignment not found",
      });
    }

    const video = await Videos.findById(assignment.videoId);
    if (!video.assignments.includes(assignment._id)) {
      return res.status(400).send({
        success: false,
        message: "assignment not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Assignment fetched successfully",
      assignment,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

exports.getSubmissionsByAssignmentId = async (req, res) => {
  try {
    const submissions = await CompletedAssignment.aggregate([
      {
        $match: {
          assignmentId: mongoose.Types.ObjectId(req.params.assignmentId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $addFields: {
          _id: 1,
          student: {
            name: "$student.name",
            email: "$student.email",
            phone: "$student.phone",
            batch: "$student.batch",
            section: "$student.section",
          },
        },
      },
    ]);

    if (!submissions) {
      return res.status(400).send({
        success: false,
        message: "No submissions found for this assignment",
      });
    }

    res.status(200).send({
      success: true,
      message: "Submissions fetched successfully",
      submissions,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* add assignment */
exports.addAssignment = async (req, res) => {
  try {
    const video = await Videos.findById(req.body.videoId);
    if (!video) {
      return res.status(400).send({
        success: false,
        message: "video not found",
      });
    }

    const assignment = new Assignment(req.body);

    video?.assignments.push(assignment?._id);
    await video.save();
    await assignment.save();
    res.status(200).send({
      success: true,
      message: "Assignment added successfully",
      assignment,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* add quiz */
exports.addQuiz = async (req, res) => {
  try {
    const data = req.body;
    const video = await Videos.findById(data.videos);
    if (!video) {
      return res.status(400).send({
        success: false,
        message: "video not found",
      });
    }

    const insertedQuizzes = await data.quizzes.map(async (quiz) => {
      const quizData = {
        user: data.user,
        videos: data.videos,
        question: quiz.question,
        answers: quiz.answers,
      };
      const newQuiz = new Quizzes(quizData);

      video?.quizzes.push(newQuiz?._id);
      await newQuiz.save();
      return newQuiz;
    });
    await video.save();

    res.status(200).send({
      success: true,
      message: "quiz added successfully",
      quizzes: insertedQuizzes,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "server error" + error?.message,
    });
  }
};

/* add quiz mark */
exports.addQuizMark = async (req, res) => {
  try {
    const data = req.body;
    const video = await Videos.findById(data.videoId);
    if (!video) {
      return res.status(400).send({
        success: false,
        message: "video not found",
      });
    }
    const quizMark = new QuizMark(data);
    await quizMark.save();

    res.status(200).send({
      success: true,
      message: "quiz mark added successfully",
      quizzes: insertedQuizzes,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "server error" + error?.message,
    });
  }
};

/* Get quiz mark */
exports.getQuizMark = async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await QuizMark.find({ studentId: studentId })
      .populate("studentId")
      .populate("videoId");
    res.status(200).send({
      success: true,
      message: "quiz mark fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "server error" + error?.message,
    });
  }
};

/* Get all quiz */
exports.getAllQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    let filter = {};

    if (id) {
      filter = { user: id };
    } else {
      filter = {};
    }

    const result = await Quizzes.find(filter)
      .populate("user")
      .populate("videos");
    res.status(200).send({
      success: true,
      message: "Quizzes fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "server error" + error?.message,
    });
  }
};

/* Get all quiz */
exports.getAllSubmittedQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    let filter = {};

    if (id) {
      filter = { user: id };
    } else {
      filter = {};
    }

    const result = await QuizMark.find(filter)
      .populate("studentId")
      .populate("user");
    res.status(200).send({
      success: true,
      message: "Quizzes marks fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "server error" + error?.message,
    });
  }
};

/* Get all submitted assignment */
exports.getAllSubmittedAssignment = async (req, res) => {
  try {
    const { _id: id } = req.user;
    let filter = {};

    if (id) {
      filter = { $or: [{ author: id }, { userId: id }] };
    } else {
      filter = {};
    }
    const result = await CompletedAssignment.find(filter).populate([
      "userId",
      "videoId",
      "courseId",
      "author",
      "moduleId",
      "assignmentId",
    ]);
    res.status(200).send({
      success: true,
      message: "Quizzes marks fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "server error" + error?.message,
    });
  }
};

/* Delete submitted assignment */
exports.deleteSubmittedAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CompletedAssignment.findByIdAndDelete({ _id: id });
    res.status(200).send({
      success: true,
      message: "Submitted Assignment delete successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "server error" + error?.message,
    });
  }
};

/* update assignment */
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(400).send({
        success: false,
        message: "Assignment not found",
      });
    }
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...req.body,
        },
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Assignment updated successfully",
      updatedAssignment,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* delete assignment */
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(400).send({
        success: false,
        message: "Assignment not found",
      });
    }

    await Videos.findByIdAndUpdate(
      assignment.videoId,
      { $pull: { assignments: assignment._id } },
      { new: true }
    );

    await CompletedAssignment.deleteMany({ assignmentId: assignment._id });
    await Marks.deleteMany({ assignmentId: assignment._id });

    assignment.remove();
    res.status(200).send({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

// Marks workflow
exports.addmarks = async (req, res) => {
  try {
    const isExist = await Mark.findOne({
      $and: [
        { submissionId: req.params.submissionId },
        { userId: req?.body?.userId },
      ],
    });

    if (isExist) {
      const result = await Mark.findOneAndUpdate(
        { submissionId: req.params.submissionId },
        req.body,
        { new: true }
      );

      res.status(200).send({
        success: true,
        message: "Mark updated successfully",
        result,
      });

      return;
    }
    const submission = await CompletedAssignment.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.submissionId),
        },
      },
      {
        $lookup: {
          from: "assignments",
          localField: "assignmentId",
          foreignField: "_id",
          as: "assignment",
        },
      },
      {
        $unwind: "$assignment",
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $project: {
          _id: 1,
          courseId: 1,
          assignmentId: 1,
          userId: 1,
          markId: 1,
          assignment: {
            _id: "$assignment._id",
            marks: 1,
          },
        },
      },
    ]);
    console.log(submission);
    if (!submission) {
      return res.status(400).send({
        success: false,
        message: "Invalid submission id",
      });
    }

    const mark = new Marks({
      assignmentId: submission[0].assignmentId,
      submissionId: submission[0]._id,
      userId: submission[0].userId,
      courseId: submission[0].courseId,
      ...req.body,
    });

    await Assignment.findByIdAndUpdate(
      submission[0].assignmentId,
      { $push: { marks: mark._id } },
      { new: true }
    );
    await CompletedAssignment.findByIdAndUpdate(
      submission[0]._id,
      { markId: mark._id },
      { new: true }
    );
    await mark.save();

    res.status(200).send({
      success: true,
      message: "Mark added successfully",
      mark,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

exports.getAllAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    let filter = {};

    if (id) {
      filter = { user: id };
    } else {
      filter = {};
    }
    const result = await Assignment.find(filter).populate("user");
    res.status(200).send({
      success: true,
      message: "Quizzes fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "server error" + error?.message,
    });
  }
};

exports.getMarksByAssignmentId = async (req, res) => {
  try {
    const marks = await Mark.aggregate([
      {
        $match: {
          assignmentId: mongoose.Types.ObjectId(req.params.assignmentId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $lookup: {
          from: "completedassignments",
          localField: "submissionId",
          foreignField: "_id",
          as: "submission",
        },
      },
      {
        $unwind: "$submission",
      },
      {
        $project: {
          _id: 1,
          mark: 1,
          fullMark: 1,
          courseId: 1,
          assignmentId: 1,
          submissionId: 1,
          userId: 1,
          submission: {
            _id: "$submission._id",
            pdf: "$submission.pdf",
          },
          student: {
            _id: "$student._id",
            name: "$student.name",
            email: "$student.email",
            phone: "$student.phone",
            batch: "$student.batch",
            section: "$student.section",
          },
        },
      },
    ]);
    if (!marks) {
      return res.status(400).send({
        success: false,
        message: "Invalid request",
      });
    }
    res.status(200).send({
      success: true,
      message: "Marks fetched successfully",
      data: marks[0],
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* add notification */
exports.addNotification = async (req, res) => {
  try {
    console.log(req.body);
    const notification = await Notification.create(req.body);

    res.status(200).send({
      success: true,
      message: "Notification added successfully",
      data: notification,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

exports.getNotification = async (req, res) => {
  try {
    const { student, teacher } = req.query;
    const conditions = [];
    if (student) {
      conditions.push({ student: student });
    }
    if (teacher) {
      conditions.push({ teacher: teacher });
    }
    const query = conditions.length > 0 ? { $or: conditions } : {};

    const notification = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate("course")
      .populate("teacher");
    res.status(200).send({
      success: true,
      data: notification,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};
