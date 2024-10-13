const Lesson = require('../models/LessonModel');
const Course = require('../models/CourseModel');

const isYoutubeUrl = (url) => {
    const youtubeUrl = 'https://www.youtube.com/embed/';
    return url.includes(youtubeUrl);
}

const addLesson = async (req, res) => {
    try {
        const { title, courseName, grade_id, video_url, pdf_url, isVisible} = req.body
        console.log("title: ", title)
        console.log("courseName: ", courseName)
        console.log("grade_id: ", grade_id)
        console.log("video_url: ", video_url)
        console.log("pdf_url: ", pdf_url)
        console.log("is visible? ", isVisible)
        
        console.log("req.body: ", req.body)
        if(!title || !courseName || !video_url || !grade_id){
            throw Error('يجب إدخال جميع البيانات')
        }
        const course = await Course.findOne({name: courseName, grade: grade_id})
        console.log("course: ", course)
        if(!course){
            throw Error('المادة الدراسية غير موجودة')
        }
        if(!isYoutubeUrl(video_url)){
            throw Error('الرابط المدخل ليس رابط فيديو من يوتيوب')
        }
        const lesson = new Lesson({title, grade: grade_id, course: course._id, video_url, pdf_url, isVisible})
        await lesson.save()
        res.status(201).json(lesson)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const getLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find()
        if(!lessons){
            throw Error('لا يوجد دروس')
        }
        res.status(200).json(lessons)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const getLesson = async (req, res) => {
    try {
        const lesson = await Lesson.find({course: req.params.id})
        if(!lesson){
            throw Error('الدرس غير موجود')
        }
        res.status(200).json(lesson)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id)
        if(!lesson){
            throw Error('الدرس غير موجود')
        }
        await Lesson.findByIdAndDelete(req.params.id);
        res.status(200).json({message: 'تم حذف الدرس بنجاح'})
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const deleteAllLessons = async (req, res) => {
    try {
        await Lesson.deleteMany()
        res.status(200).json({message: 'تم حذف جميع الدروس بنجاح'})
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const latestWeekInCourse = async (req, res) => {
    try {
        const { courseName, grade_id } = req.body
        if(!courseName || !grade_id){
            throw Error('يجب إدخال جميع البيانات')
        }
        const course = await Course.findOne({name: courseName, grade: grade_id})
        if(!course){
            throw Error('الكورس غير موجود')
        }
        const course_id = course._id
        console.log("course_id: ", course_id)
        console.log("grade_id: ", grade_id)
        let week_number = 1
        let month = ""
        const latestWeek = await Lesson.find({course_id, grade_id}).sort({week_number: -1})
        console.log("latestWeek: ", latestWeek)
        if(!latestWeek){
            throw Error('لا يوجد دروس')
        }
        if(latestWeek.length === 2){
            console.log("1: ", latestWeek[0].week_number)
            week_number = latestWeek[0].week_number + 1
        }
        if(latestWeek.length === 1){
            console.log("2: ", latestWeek[0].week_number)
            week_number = latestWeek[0].week_number
        }

        if(latestWeek.length === 2 && latestWeek[0].week_number === 4){
            week_number = 1
        }
        res.status(200).json(week_number)
    }
    catch (error) {
        console.error(error.message)
        res.status(401).send('Server error: ', error.message)
    }
}

module.exports = { addLesson, getLesson, getLessons, deleteLesson, deleteAllLessons, latestWeekInCourse };