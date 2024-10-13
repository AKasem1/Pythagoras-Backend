const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    grade: { 
        type: Schema.Types.ObjectId, 
        ref: 'Grade', 
        required: true 
    },
    enrolledCount: { 
        type: Number, 
        default: 0 
    },
    imgURL: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
