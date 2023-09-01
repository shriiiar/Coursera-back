const Assignment = require("../models/assignmentSchema");
const CompletedAssignment = require("../models/completedAssignment");
const Courses = require("../models/coursesModel");
const Milestones = require("../models/milestonesModel");
const Modules = require("../models/modulesModel");
const Notification = require("../models/notificationSchema");
const Quizzes = require("../models/quizzesModel");
const User = require("../models/userModel");
const Videos = require("../models/videosModel");
const mongoose = require("mongoose");

/* get course by id */
exports.getCourseById = async (req, res) => {
  try {
    const course = await Courses.findById(req.params.id);
    if (!course) {
      return res.status(400).send({
        success: false,
        message: "course not found",
      });
    }

    if (!course?.students.includes(req.user?._id)) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }

    // check if user is enrolled in course
    const userData = await User.find(
      { _id: req.user?._id, courses: { $in: [req.params.id] } },
      { password: 0 }
    );

    if (!userData) {
      return res.status(400).send({
        success: false,
        message: "unauthorized course request",
      });
    }

    res.status(200).send({
      success: true,
      data: course,
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
    const course = await Courses.findById(req.params.courseId);
    if (!course) {
      return res.status(400).send({
        success: false,
        message: "course not found",
      });
    }
    const milestones = await Milestones.find({
      courseId: req.params.courseId,
    });
    res.status(200).send({
      success: true,
      data: milestones,
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
    const milestone = await Milestones.findById(req.params.milestoneId);
    if (!milestone) {
      return res.status(400).send({
        success: false,
        message: "milestone not found",
      });
    }
    const modules = await Modules.find({
      milestoneId: req.params.milestoneId,
    });
    res.status(200).send({
      success: true,
      data: modules,
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
    const module = await Modules.findById(req.params.moduleId);
    if (!module) {
      return res.status(400).send({
        success: false,
        message: "module not found",
      });
    }
    const videos = await Videos.find({
      moduleId: req.params.moduleId,
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

// get assignment by id
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.aggregate([
      {
        $match: {
          videoId: mongoose.Types.ObjectId(req.params.videoId),
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $match: {
          "course.students": { $in: [mongoose.Types.ObjectId(req.user?._id)] },
        },
      },
    ]);

    if (!assignment) {
      return res.status(400).send({
        success: false,
        message: "Invalid request",
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

// get quiz by id
exports.getQuizById = async (req, res) => {
  try {
    const video = await Videos.findById(req.params.videoId);

    if (!video) {
      return res.status(400).send({
        success: false,
        message: "Invalid request",
      });
    }
    const result = await video.populate({
      path: "quizzes",
      select: "-contest -assignments -description",
    });
    res.status(200).send({
      success: true,
      message: "Quizzes fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

exports.getCompletedAssignmentById = async (req, res) => {
  try {
    const submission = await CompletedAssignment.aggregate([
      {
        $match: {
          assignmentId: mongoose.Types.ObjectId(req.params.assignmentId),
          userId: mongoose.Types.ObjectId(req.user?._id),
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $match: {
          "course.students": { $in: [mongoose.Types.ObjectId(req.user?._id)] },
        },
      },
      {
        $lookup: {
          from: "marks",
          localField: "markId",
          foreignField: "_id",
          as: "mark",
        },
      },
      { $unwind: { path: "$mark", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          courseId: 1,
          moduleId: 1,
          videoId: 1,
          assignmentId: 1,
          markId: 1,
          pdf: 1,
          mark: {
            _id: "$mark._id",
            mark: "$mark.mark",
            fullMark: "$mark.fullMark",
          },
        },
      },
    ]);

    res.status(200).send({
      success: true,
      message: "Submission fetched successfully",
      submission,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

// upload assignment
exports.uploadAssignment = async (req, res) => {
  try {
    const completedAssignmentRes = await CompletedAssignment.findOne({
      $and: [
        { assignmentId: req.params.assignmentId },
        { userId: req.user?._id },
      ],
    });
    if (completedAssignmentRes) {
      return res.status(400).send({
        success: false,
        message: "Submission already exist",
      });
    }

    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(400).send({
        success: false,
        message: "Question not found",
      });
    }

    const video = await Videos.findById(assignment.videoId);
    if (!video) {
      return res.status(400).send({
        success: false,
        message: "Video not found",
      });
    }

    const user = await User.findById(req.user?._id);
    if (!user.courses.includes(video.courseId)) {
      return res.status(400).send({
        success: false,
        message: "Unauthorized",
      });
    }

    const newCompletedAssignment = new CompletedAssignment({
      courseId: video.courseId,
      moduleId: video.moduleId,
      videoId: video._id,
      assignmentId: assignment._id,
      userId: user._id,
      ...req.body,
    });
    console.log(newCompletedAssignment);
    assignment.submissions.push(newCompletedAssignment._id);
    await assignment.save();
    await newCompletedAssignment.save();

    res.status(200).send({
      success: true,
      message: "Uploaded assignment successfully",
      completedAssignment: newCompletedAssignment,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

exports.discardSubmission = async (req, res) => {
  try {
    // completedAssignmentId
    const completedAssignment = await CompletedAssignment.findById(
      req.params.submissionId
    );
    if (!completedAssignment) {
      return res.status(400).send({
        success: false,
        message: "Submission not found",
      });
    }

    if (completedAssignment.userId.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "Unauthorized",
      });
    }

    const assignment = await Assignment.findById(
      completedAssignment.assignmentId
    );
    if (!assignment) {
      return res.status(400).send({
        success: false,
        message: "Question not found",
      });
    }

    const user = await User.findById(req.user?._id);
    if (!user.courses.includes(assignment.courseId)) {
      return res.status(400).send({
        success: false,
        message: "Unauthorized",
      });
    }

    assignment.submissions = assignment.submissions.filter(
      (id) => id.toString() !== completedAssignment._id.toString()
    );
    await assignment.save();

    completedAssignment.remove();

    res.status(200).send({
      success: true,
      message: "Submission removed successfully",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

// notification
exports.getNotificationForStudent = async (req, res) => {
  try {
    const { batch, section } = req.query;
    let notification;
    if (batch === "all" && section === "all") {
      notification = await Notification.find({});
    } else if (batch === "self") {
      notification = await Notification.find({
        student: section,
      });
    }
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
