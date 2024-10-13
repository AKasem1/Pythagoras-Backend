const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    amount: { 
        type: Schema.Types.Decimal128, 
        required: true 
    },
    payment_method: { 
        type: String, 
        enum: ['wallet', 'external'], 
        required: true 
    },
    payment_date: { 
        type: Date, 
        default: Date.now 
    },
    package_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Package', 
        default: null 
    },
    courses: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Course' 
    }]
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
