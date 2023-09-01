const router = require("express").Router();

// import controllers
const studentController = require("../controllers/studentController");
const AuthGuard = require("../middlewares/AuthGuard");

// @route GET api/courses/:id
// @desc course by id
// @private secure
router.get("/course/:id", AuthGuard, studentController.getCourseById);

// @route GET api/courses/milestone/:id
// @desc milestones by course
// @private secure
router.get(
  "/milestone/:courseId",
  AuthGuard,
  studentController.getMilestonesByCourse
);

// @route GET api/courses/module/:id
// @desc modules by milestone
// @private secure
router.get(
  "/module/:milestoneId",
  AuthGuard,
  studentController.getModulesByMilestone
);

// @route GET api/courses/video/:id
// @desc videos by module
// @private secure
router.get("/video/:moduleId", AuthGuard, studentController.getVideosByModule);

// @route GET api/student/course/get-assignment/:videoId
// @desc get assignment for a video
// @access private

router.get(
  "/get-assignment/:videoId",
  AuthGuard,
  studentController.getAssignmentById
);
router.get(
  "/get-quiz/:videoId",
  // AuthGuard,
  studentController.getQuizById
);

// @route GET api/student/course/get-completed-assignment/:assignmentId
// @desc get completed assignment for a video
// @access private
// assignment id means question's id

// needs fixing
router.get(
  "/get-completed-assignment/:assignmentId",
  AuthGuard,
  studentController.getCompletedAssignmentById
);

// @route POST api/student/course/upload-assignment/:videoId
// @desc uplaod assignment for a video
// @access private
router.post(
  "/upload-assignment/:assignmentId",
  AuthGuard,
  studentController.uploadAssignment
);

// @route DELETE api/student/course/upload-assignment/:videoId
// @desc uplaod assignment for a video
// @access private
router.delete(
  "/discard-submission/:submissionId",
  AuthGuard,
  studentController.discardSubmission
);

router.get(
  "/getNotification",
  // AuthGuard,
  // TeacherGuard,
  studentController.getNotificationForStudent
);

//export
module.exports = router;
