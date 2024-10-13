const express = require('express');
const userAuth = require('../middlewares/userAuth')
const { signup, login, editProfile, forgetPassword, otpVerification, resetPassword } = require('../controllers/userController');
const { getGrades } = require('../controllers/gradeController');
const { getCoursesByGrade, getCourseById } = require('../controllers/courseController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgetpassword', forgetPassword);
router.post('/otpverification', otpVerification);
router.post('/resetpassword', resetPassword);
router.get('/grades', getGrades);
router.get('/coursesbygrade/:grade_id', getCoursesByGrade);

// router.use(userAuth);
router.use(userAuth);
router.put('/editprofile/:id', editProfile)
router.get('/coursebyid/:courseId', getCourseById);

module.exports = router;