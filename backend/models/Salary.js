const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    position: { type: String, required: true },
    salary: { type: Number, default: 0},
    deduction: { type: Number, default: 0 },
    commission: { type: Number, default: 0 }
});

module.exports = mongoose.model('Salary', salarySchema);
