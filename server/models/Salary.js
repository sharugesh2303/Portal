// G:\college-portal\server\models\Salary.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const salarySchema = new Schema({
    // --- Standard Fields (Already Exist) ---
    faculty: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    month: {
        type: String, // e.g., "November"
        required: true,
    },
    year: {
        type: Number, // e.g., 2025
        required: true,
    },
    // Net Pay (Calculated total amount)
    amount: { 
        type: Number, 
        required: true,
    },
    
    // --- DETAILED EARNINGS (NEWLY ADDED) ---
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    other_earnings: { type: Number, default: 0 },

    // --- DETAILED DEDUCTIONS (NEWLY ADDED) ---
    pf: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    other_deductions: { type: Number, default: 0 },

}, { timestamps: true });

const Salary = mongoose.model('Salary', salarySchema);

export default Salary;