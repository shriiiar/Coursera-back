const Assignment = require("../models/assignmentSchema");
const CourseRequest = require("../models/courseRequestSchema");
const Courses = require("../models/coursesModel");
const Milestones = require("../models/milestonesModel");
const Modules = require("../models/modulesModel");
const User = require("../models/userModel");
const Videos = require("../models/videosModel");
const { findCourseByNameService } = require("../services/coursesService");

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

/* get courses */
exports.getCourses = async (req, res) => {
  try {
    const courses = await Courses.find({ user: req.user?._id });
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

/* get all courses */
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Courses.find().sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "courses fetched successfully",
      data: courses,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* get all courses */
exports.getAllRequestedCourse = async (req, res) => {
  try {
    const courses = await CourseRequest.find()
      .populate("course")
      .populate("user");
    res.status(200).send({
      success: true,
      message: "course requested data fetched successfully",
      data: courses,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* create course request */
exports.createCourseRequest = async (req, res) => {
  try {
    const data = { ...req.body, user: req.user?._id };
    const result = await CourseRequest.create(data);
    console.log(result);
    res.status(200).send({
      success: true,
      message: "course requested successfully created",
      data: result,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* delete course request */
exports.deleteCourseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CourseRequest.findOneAndDelete({
      $or: [{ _id: id }, { user: id }],
    });
    res.status(200).send({
      success: true,
      message: "course requested successfully deleted",
      data: result,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

/* update course */
exports.updateCourse = async (req, res) => {
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
    const updatedCourse = await Courses.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "course updated successfully",
      course: updatedCourse,
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

    await students.save();

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

/* get course by teacher */
exports.getTeacherCourse = async (req, res) => {
  try {
    const userId = req.user?._id;
    const courseId = req.params.courseId;
    const course = await Courses.findOne({
      $and: [
        { user: userId },
        {
          _id: courseId,
        },
      ],
    });
    res.status(202).send({
      success: true,
      course: course,
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

    const milestoneData = {
      user: req.user?._id,
      courseId: req.params.id,
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
    // if (course.user.toString() !== req.user?._id.toString()) {
    // 	return res.status(400).send({
    // 		success: false,
    // 		message: "unauthorized",
    // 	});
    // }

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

    // if (milestone.user.toString() !== req.user?._id.toString()) {
    // 	return res.status(400).send({
    // 		success: false,
    // 		message: "unauthorized",
    // 	});
    // }

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

/* get modules by course id */
exports.getModulesByCourseId = async (req, res) => {
  try {
    const modules = await Modules.find({
      courseId: req.params.id,
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
    if (module.user.toString() !== req.user?._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "unauthorized",
      });
    }
    const videoData = {
      user: req.user?._id,
      courseId: req.body?.courseId,
      moduleId: req.params.id,
      name: req.body.name,
      description: req.body.description,
      url: req.body.url,
      totalTimes: req.body.totalTimes,
      isQuiz: req.body.isQuiz,
    };
    const course = await Courses.findById(req.body?.courseId);
    const video = await Videos.create(videoData);
    module.videos.push(video._id);
    course.videos.push(video?._id);
    await module.save();
    await course.save();
    res.status(200).send({
      success: true,
      message: "video added successfully",
      module,
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
    // if (module.user.toString() !== req.user?._id.toString()) {
    // 	return res.status(400).send({
    // 		success: false,
    // 		message: "unauthorized",
    // 	});
    // }
    const videos = await Videos.find({
      moduleId: req.params.id,
      // user: req.user?._id,
    }).populate("quizzes");
    res.status(200).send({
      success: true,
      message: "videos fetched successfully",
      videos,
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

    const milestones = await Milestones.find({ courseId: req.params.id });
    const modules = await Modules.find({ courseId: req.params.id });
    const videos = await Videos.find({ courseId: req.params.id });

    const courseData = course?.milestones.map((milestone) => {
      const milestoneData = {
        _id: milestone._id,
        name: milestone.name,
        description: milestone.description,
        modules: [],
      };
      const milestoneModules = modules.filter(
        (module) => module.milestoneId.toString() === milestone._id.toString()
      );
      milestoneModules.forEach((module) => {
        const moduleData = {
          _id: module._id,
          name: module.name,
          description: module.description,
          videos: [],
        };
        const moduleVideos = videos.filter(
          (video) => video.moduleId.toString() === module._id.toString()
        );
        moduleVideos.forEach((video) => {
          moduleData.videos.push(video);
        });
        milestoneData.modules.push(moduleData);
      });
      return milestoneData;
    });

    res.status(200).send({
      success: true,

      message: "course fetched successfully",
      data: courseData,
      course,
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
    const courses = await Courses.find({ user: req.params.id });
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

/* get students by course id */
exports.getNotEnrolledStudentsByCourse = async (req, res) => {
  try {
    const course = await Courses.findById(req.params.courseId);
    const { q } = req.query;
    const filter = {
      _id: {
        $nin: course.students,
      },
      role: "student",
      isSuspended: false,
    };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    // get students who are not enrolled yet
    const students = await User.find(filter);

    res.status(202).send({
      success: true,
      data: students,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
    });
  }
};

// get all the enrolled student
exports.getEnrolledStudentsByCourse = async (req, res) => {
  try {
    const course = await Courses.findById(req.params.courseId);
    const { q } = req.query;
    const filter = {
      _id: {
        $in: course.students,
      },
      role: "student",
      isSuspended: false,
    };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    // get students who are not enrolled yet
    const students = await User.find(filter);
    const count = await User.countDocuments({
      _id: {
        $in: course.students,
      },
      role: "student",
      isSuspended: false,
    });

    res.status(202).send({
      success: true,
      data: students,
      total: count,
    });
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

// get all the enrolled courses by student
exports.getEnrolledCoursesByStudent = async (req, res) => {
  try {
    const courses = await Courses.find({ students: req.user?._id }).populate(
      "videos"
    );
    const total = await Courses.countDocuments({ students: req.user?._id });
    res.status(202).send({
      success: true,
      data: courses,
      total: total,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
      err,
    });
  }
};

// get all the enrolled students by teacher
exports.getAllEnrolledStudents = async (req, res) => {
  try {
    const courses = await Courses.find({ user: req.user?._id }).select(
      "_id courseName "
    );
    const students = await User.find({
      courses: { $in: courses.map((course) => course._id) },
      role: "student",
    })
      .select("-password")
      .populate("courses", "_id courseName");

    const { q, courseId, batchName, sectionName } = req.query;

    const filter = {
      role: "student",
      isSuspended: false,
      courses: { $in: courses.map((course) => course._id) },
    };

    // filter by search
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { studentId: { $regex: q, $options: "i" } },
      ];
    }

    // filter by course
    if (courseId) {
      filter.courses = courseId;
    }

    // filter by batch
    if (batchName) {
      filter.batch = batchName;
    }

    // filter by section
    if (sectionName) {
      filter.section = sectionName;
    }

    // student actual data with filter
    const studentsData = await User.find(filter)
      .select("-password")
      .populate("courses", "_id courseName");

    const total = await User.countDocuments(filter);

    // get all the unique batch in array
    const batches = [...new Set(students.map((student) => student.batch))];

    // get all the unique sections in array
    const sections = [...new Set(students.map((student) => student.section))];

    res.status(202).send({
      success: true,
      filterData: {
        courses,
        batches,
        sections,
      },
      data: studentsData,
      total,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "server error" + err?.message,
      err,
    });
  }
};

exports.addAssignment = async (req, res) => {
  try {
    const assignment = new Assignment({
      ...req.body,
    });
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
