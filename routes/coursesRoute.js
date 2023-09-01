const router = require("express").Router();

// import controllers
const courseController = require("../controllers/coursesController");

// import middleware
const AuthGuard = require("../middlewares/AuthGuard");
const StudentGuard = require("../middlewares/StudentGuard");
const TeacherGuard = require("../middlewares/TeacherGuard");

// @route   GET api/courses/create
// @desc courses
// @private secure
router.post("/create", AuthGuard, TeacherGuard, courseController.createCourse);

// @route POST api/courses/student/access/:id
// @desc give access to the student to the course by teacher
// @private secure
router.post(
  "/student/access/:id",
  AuthGuard,
  TeacherGuard,
  courseController.getAccessToCourse
);

// @route GET api/courses/delete/:id
// @desc delete course
// @private secure
router.delete(
  "/delete/:id",
  AuthGuard,
  TeacherGuard,
  courseController.deleteCourse
);

// @route GET api/courses/add-milestone/:id
// @desc add milestone to course
// @private secure
router.post(
  "/add-milestone/:id",
  AuthGuard,
  TeacherGuard,
  courseController.addMilestone
);

// @route GET api/courses/milestone/:id
// @desc milestones by course
// @private secure
router.get(
  "/milestone/:id",
  AuthGuard,
  //   TeacherGuard,
  courseController.getMilestonesByCourse
);

// @route PATCH api/courses/milestone/update/:id
// @desc update milestone
// @private secure
router.patch(
  "/milestone/update/:id",
  AuthGuard,
  TeacherGuard,
  courseController.updateMilestone
);

// @route GET api/courses/add-module/:id
// @desc add module to milestone
// @private secure
router.post(
  "/add-module/:id",
  AuthGuard,
  TeacherGuard,
  courseController.addModule
);

// @route GET api/courses/module/:id
// @desc modules by milestone
// @private secure
router.get(
  "/module/:id",
  AuthGuard,
  //   TeacherGuard,
  courseController.getModulesByMilestone
);

// @route GET api/courses/module/:courseId
// @desc modules by course id
// @private secure
router.get(
  "/module/course/:id",
  AuthGuard,
  //   TeacherGuard,
  courseController.getModulesByCourseId
);
// @route PATCH api/courses/module/update/:id
// @desc update module
// @private secure
router.patch(
  "/module/update/:id",
  AuthGuard,
  TeacherGuard,
  courseController.updateModule
);

// @route GET api/courses/add-video/:id
// @desc add video to module
// @private secure
router.post(
  "/add-video/:id",
  AuthGuard,
  TeacherGuard,
  courseController.addVideo
);

// @route GET api/courses/video/:id
// @desc videos by module
// @private secure
router.get(
  "/video/:id",
  AuthGuard,
  //   TeacherGuard,
  courseController.getVideosByModule
);

// @route PATCH api/courses/video/update/:id
// @desc update video
// @private secure
router.patch(
  "/video/update/:id",
  AuthGuard,
  TeacherGuard,
  courseController.updateVideo
);

// @route POST api/courses/update/:id
// @desc update course
// @private secure
router.post(
  "/update/:id",
  AuthGuard,
  TeacherGuard,
  courseController.updateCourse
);

// @route GET api/courses/:id
// @desc course by id
// @private secure
router.get("/course/:id", AuthGuard, courseController.getCourseById);

// @route GET api/courses/teacher/:id
// @desc courses by teacher
// @private secure
router.get(
  "/teacher/:id",
  AuthGuard,
  TeacherGuard,
  courseController.getTeacherCourses
);

// @route GET api/courses/teacher/:id
// @desc courses by teacher
// @private secure
router.get(
  "/teacher/course/:courseId",
  AuthGuard,
  TeacherGuard,
  courseController.getTeacherCourse
);

// @route GET api/courses/student/:id
// @desc students by course
// @private secure
router.get(
  "/courses/not-enrolled-student/:courseId",
  AuthGuard,
  TeacherGuard,
  courseController.getNotEnrolledStudentsByCourse
);

// @Route get api/enrolled-students/:courseId
// @desc get enrolled students by course
// @access private
router.get(
  "/enrolled-students/:courseId",
  AuthGuard,
  TeacherGuard,
  courseController.getEnrolledStudentsByCourse
);

// @route DELETE api/remove-student-from-course/:courseId/:studentId
// @desc remove student from course
// @access private
router.delete(
  "/remove-student-from-course/:courseId/:studentId",
  AuthGuard,
  TeacherGuard,
  courseController.removeStudentFromCourse
);

// get enrolled courses by student
// @route GET api/enrolled-courses/student/:studentId
// @desc enrolled courses by student
// @private secure
router.get(
  "/enrolled-courses/student",
  AuthGuard,
  StudentGuard,
  courseController.getEnrolledCoursesByStudent
);

// @route GET api/courses/all-enrolled-students
// @desc all enrolled students
// @private secure
router.get(
  "/all-enrolled-students",
  AuthGuard,
  TeacherGuard,
  courseController.getAllEnrolledStudents
);

router.post(
  "/add-assignment",
  AuthGuard,
  TeacherGuard,
  courseController.addAssignment
);

// @route  GET api/courses
// @desc courses
// @private secure
router.get("/", AuthGuard, courseController.getCourses);

router.get("/all-courses", AuthGuard, courseController.getAllCourses);
router.get(
  "/all-requested-course",
  AuthGuard,
  courseController.getAllRequestedCourse
);
router.post(
  "/course-request",
  AuthGuard,
  StudentGuard,
  courseController.createCourseRequest
);
router.delete(
  "/delete-course-request/:id",
  AuthGuard,
  courseController.deleteCourseRequest
);

//export
module.exports = router;
