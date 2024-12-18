const Course = require('../models/CourseModel');
const Grade = require('../models/GradeModel');
const mongoose = require('mongoose');
const XLSX = require('xlsx');

const isCodeExist = async (code, courseId) => {
    const course = await Course.findOne({
        _id: courseId,
        "codes.code": code
    });
    return course !== null;
};

const addCourse = async (req, res) => {
    try {
        const courses = req.body
        console.log("courses: ", courses)
        if(!courses){
            throw Error('يجب إدخال الكورسات')
        }
        console.log("Passed courses check")
        const coursesArray = []
        for (let course of courses) {
            const grade = await Grade.findOne({name: course.grade})
            if(!grade){
                throw Error('الصف الدراسي غير موجود')
            }
            coursesArray.push({name: course.name, grade: grade._id, imgURL: course.imgURL, price: course.price})
        }
        const createdCourses = await Course.insertMany(coursesArray)
        console.log("createdCourses: ", createdCourses)
        res.status(200).json({message: 'تمت إضافة الكورسات بنجاح', courses: createdCourses})
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('grade')
        if(!courses){
            throw Error('لا يوجد كورسات')
        }
        res.status(200).json(courses)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        if(!course){
            throw Error('الكورس غير موجود')
        }
        await course.remove()
        res.status(200).json({message: 'تم حذف الكورس بنجاح'})
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const updateCourse = async (req, res) => {
    try {
        const { name, gradeName } = req.body
        const { id } = req.params
        if(!name && !gradeName){
            throw Error('يجب إدخال جميع البيانات')
        }
        const grade = await Grade.findOne({name: gradeName})
        if(gradeName && !grade){
            throw Error('الصف الدراسي غير موجود')
        }
        const course = await Course.findById(id)
        if(!course){
            throw Error('الكورس غير موجود')
        }
        name? course.name = name : null
        gradeName? course.grade = grade._id : null
        await course.save()
        res.status(200).json(course)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const getCoursesByGrade = async (req, res) => {
    try {
        const { grade_id } = req.params
        console.log("grade_id: ", grade_id)
        const courses = await Course.find({grade: grade_id}).populate('grade')
        if(!courses){
            throw Error('لا يوجد كورسات')
        }
        console.log("courses: ", courses)
        res.status(200).json(courses)
    }
    catch (error) {
        console.error(error.message)
        res.status(400).send('Server error: ', error.message)
    }
}
const getCoursesByGradeName = async (req, res) => {
    try {
        const { gradeName } = req.body;
        const grade = await Grade.findOne({name: gradeName});
        const courses = await Course.find({grade: grade._id})
        if(!courses){
            throw Error('لا يوجد كورسات')
        }
        console.log("courses: ", courses)
        res.status(200).json(courses)
    }
    catch (error) {
        console.error(error.message)
        res.status(400).send('Server error: ', error.message)
    }
}

const getCourseById = async (req, res) => {
    try {
        console.log("req.params.courseId: ", req.params.courseId)
        const course = await Course.findById(req.params.courseId).populate('grade')
        if(!course){
            throw Error('الكورس غير موجود')
        }
        res.status(200).json(course)
    }
    catch (error) {
        console.error(error.message)
        res.status(400).send('Server error: ', error.message)
    }
}

const deleteAllCourses = async (req, res) => {
    try {
        await Course.deleteMany()
        res.status(200).json({message: 'تم حذف جميع الكورسات بنجاح'})
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error: ', error.message)
    }
}

const generateCodes = async (req, res) => {
    try {
        const { numberOfCodes, courseId } = req.body;
        const codePromises = Array.from({ length: numberOfCodes }, async () => {
            let newCode;
            do {
                newCode = (Math.random() + 1).toString(36).substring(7);
            } while (await isCodeExist(newCode, courseId));
            return newCode;
        });
        
        const generatedCodes = await Promise.all(codePromises)
        const bulkOperations = generatedCodes.map(code => ({
            updateOne: {
                filter: { _id: courseId },
                update: { $push: { codes: { code } } }
            }
        }));
        
        await Course.bulkWrite(bulkOperations);
        res.status(200).json(generatedCodes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error: ' + error.message);
    }
};


const getCodes = async (req, res) => {
    const { courseId, codeStatus } = req.body;
    try {
        console.log(courseId, codeStatus)
        const courseObjectId = new mongoose.Types.ObjectId(courseId);
        const result = await Course.aggregate([
            { $match: { _id: courseObjectId } },
            {
                $project: {
                    codes: {
                        $filter: {
                            input: "$codes",
                            as: "code",
                            cond: { $eq: ["$$code.status", codeStatus] }
                        }
                    }
                }
            }
        ]);

        if (result.length === 0) {
            throw new Error('هذا الكورس غير موجود');
        }

        res.status(200).json(result[0].codes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error: ' + error.message);
    }
};


const getExcelCodes = async (req, res) => {
    const { courseId, codeStatus, selectedGradeName } = req.body;
    try {
        let codes = [];
        console.log(courseId, codeStatus, selectedGradeName)
        const courseObjectId = new mongoose.Types.ObjectId(courseId);
        if( codeStatus == "تم الاستخدام" || codeStatus == "تم البيع"){
            const result = await Course.aggregate([
                { $match: { _id: courseObjectId } },
                {
                    $project: {
                        codes: {
                            $filter: {
                                input: "$codes",
                                as: "code",
                                cond: { $eq: ["$$code.status", codeStatus] }
                            }
                        }
                    }
                }
            ]);
            if (result.length === 0) {
                throw new Error('هذا الكورس غير موجود');
            }
            codes = result[0].codes;
        }
        else if(codeStatus == "متاح"){
            const updatedCourse = await Course.findOneAndUpdate(
                { _id: courseObjectId },
                { $set: { "codes.$[elem].status": "تم البيع" } },
                { 
                    arrayFilters: [{ "elem.status": codeStatus }],
                    new: true // Return the updated document
                }
            );
    
            if (!updatedCourse) {
                throw new Error('هذا الكورس غير موجود');
            }
            codes = updatedCourse.codes.filter(code => code.status === "تم البيع");
        }

        const workbook = XLSX.utils.book_new()
        const worksheetData = codes.map(c => ({
            'الكود': c.code,
            'الصف': selectedGradeName
          }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Codes');
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        res.setHeader('Content-Disposition', 'attachment; filename="codes.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.status(200).send(buffer);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error: ' + error.message);
    }
};

module.exports = {
    addCourse,
    getCourses,
    deleteCourse,
    updateCourse,
    getCoursesByGrade,
    deleteAllCourses,
    getCoursesByGradeName,
    getCourseById,
    generateCodes,
    getCodes,
    getExcelCodes
}