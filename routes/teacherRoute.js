const router = require("express").Router();

// import controllers
const teacherController = require("../controllers/teacherController");
const AuthGuard = require("../middlewares/AuthGuard");
const TeacherGuard = require("../middlewares/TeacherGuard");

// course

// @route   GET api/courses/add
// @desc courses
// @private secure
router.post(
  "/course/add",
  AuthGuard,
  TeacherGuard,
  teacherController.createCourse
);

// @route   GET api/courses/edit/:courseId
// @desc Edit course
// @private secure
router.patch(
  "/course/edit/:courseId",
  AuthGuard,
  TeacherGuard,
  teacherController.editCourse
);

// @route GET api/courses/teacher/
// @desc courses by teacher
// @private secure
router.get(
  "/courses",
  AuthGuard,
  TeacherGuard,
  teacherController.getTeacherCourses
);

// @route GET api/courses/delete/:id
// @desc delete course
// @private secure
router.delete(
  "/course/delete/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.deleteCourse
);

// Milestone

// @route GET api/courses/add-milestone/:courseId
// @desc add milestone to course
// @private secure
router.post(
  "/course/add-milestone/:courseId",
  AuthGuard,
  TeacherGuard,
  teacherController.addMilestone
);

// @route PATCH api/courses/milestone/update/:id
// @desc update milestone
// @private secure
router.patch(
  "/course/milestone/update/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.updateMilestone
);

// @route PATCH api/courses/milestone/delete/:id
// @desc delete milestone
// @private secure
router.delete(
  "/course/milestone/delete/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.deleteMilestone
);

// @route GET api/courses/milestone/:id
// @desc milestones by course
// @private secure
router.get(
  "/course/milestone/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.getMilestonesByCourse
);

// Module

// @route GET api/courses/add-module/:id
// @desc add module to milestone
// @private secure
router.post(
  "/course/add-module/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.addModule
);

// @route PATCH api/courses/module/update/:id
// @desc update module
// @private secure
router.patch(
  "/course/module/update/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.updateModule
);

// @route DELETE api/courses/module/delete/:id
// @desc delete module
// @private secure
router.delete(
  "/course/module/delete/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.deleteModule
);

// @route GET api/courses/module/:id
// @desc modules by milestone
// @private secure
router.get(
  "/course/module/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.getModulesByMilestone
);

// Video

// @route GET api/courses/add-video/:id
// @desc add video to module
// @private secure
router.post(
  "/course/add-video/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.addVideo
);

// @route GET api/courses/video/:id
// @desc videos by module
// @private secure
router.get(
  "/course/video/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.getVideosByModule
);

// @route PATCH api/courses/video/update/:id
// @desc update video
// @private secure
router.patch(
  "/course/video/update/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.updateVideo
);

// @route DELETE api/courses/video/delete/:id
// @desc delete video
// @private secure
router.delete(
  "/course/video/delete/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.deleteVideo
);

// Student access

// @route POST api/courses/student/access/:id
// @desc give access to the student to the course by teacher
// @private secure
router.post(
  "/course/give-student-access/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.getAccessToCourse
);

// @route DELETE api/remove-student-from-course/:courseId/:studentId
// @desc remove student from course
// @access private
router.delete(
  "/course/remove-student-from-course/:courseId/:studentId",
  AuthGuard,
  TeacherGuard,
  teacherController.removeStudentFromCourse
);

// Assignments

// @route GET api/teacher/course/get-assignment/:id
// @desc get assignment for a video
// @access private
router.get(
  "/course/get-assignment/:assignmentId",
  AuthGuard,
  TeacherGuard,
  teacherController.getAssignmentById
);

// @route GET api/teacher/course/get-submissions/:assignment id
// @desc get submission for an assignment
// @access private
router.get(
  "/assignment/get-submissions/:assignmentId",
  AuthGuard,
  TeacherGuard,
  teacherController.getSubmissionsByAssignmentId
);

// @route POST api/teacher/course/add-assignment/:id
// @desc add assignment for a video
// @access private
router.post(
  "/add-assignment",
  AuthGuard,
  TeacherGuard,
  teacherController.addAssignment
);

// @route PATCH api/teacher/course/update-assignment/:id
// @desc update assignment
// @access private
router.patch(
  "/course/update-assignment/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.updateAssignment
);

// @route DELETE api/teacher/course/delete-assignment/:id
// @desc delete assignment
// @access private
router.delete(
  "/course/delete-assignment/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.deleteAssignment
);

// Marks workflow

// @route GET api/teacher/assignment/get-marks/:assignment id
// @desc get marks for an assignment
// @access private
router.get(
  "/assignment/get-marks/:assignmentId",
  AuthGuard,
  TeacherGuard,
  teacherController.getMarksByAssignmentId
);

// @route POST api/teacher/assignment/add-marks/:submissionId
// @desc add marks for an assignment
// Submission id means completed assignment _id
// @access private
router.post(
  "/assignment/add-marks/:submissionId",
  AuthGuard,
  TeacherGuard,
  teacherController.addmarks
);

router.get(
  "/get-all-assignment/:id",
  AuthGuard,
  TeacherGuard,
  teacherController.getAllAssignments
);

// Notifications

router.post(
  "/addNotification",
  // AuthGuard,
  // TeacherGuard,
  teacherController.addNotification
);
router.get(
  "/getNotification",
  // AuthGuard,
  // TeacherGuard,
  teacherController.getNotification
);

router.post(
  "/add-quiz",
  AuthGuard,
  // TeacherGuard,
  teacherController.addQuiz
);

router.post("/add-quiz-mark", AuthGuard, teacherController.addQuizMark);

router.get(
  "/get-quiz-mark/:studentId",
  AuthGuard,
  teacherController.getQuizMark
);

router.get("/get-all-quiz/:id", AuthGuard, teacherController.getAllQuiz);

router.get(
  "/get-all-submitted-quiz/:id",
  AuthGuard,
  teacherController.getAllSubmittedQuiz
);

router.get(
  "/get-all-submitted-assignment",
  AuthGuard,
  teacherController.getAllSubmittedAssignment
);

router.delete(
  "/delete-submitted-assignment/:id", AuthGuard, teacherController.deleteSubmittedAssignment
)

//export
module.exports = router;
