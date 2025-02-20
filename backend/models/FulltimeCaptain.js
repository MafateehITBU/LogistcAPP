const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const fulltimeCaptainSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Phone number must be exactly 10 digits.'],
    },
    role: {
        type: String,
        enum: ['procurement', 'delivery'],
        required: true,
    },
    walletNo: {
        type: String,
        required: false,
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    rating: {
        type: Number,
        default: 0,
        required: false,
    },
    points: {
        type: Number,
        default: 0,
    },
    profilePicture: {
        type: String,
        required: false,
        default: 'default_profile_picture.jpg',
    },
    car_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    },
    accountStatus: {
        type: String,
        default: 'approved',
        enum: ['pending', 'approved', 'incomplete', 'rejected']
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
    ordersCount: {
        type: Number,
        default: 0
    },
    orderCountHistory: [{
        year: {
            type: Number,
            required: true
        },
        months: {
            January: { type: Number, default: 0 },
            February: { type: Number, default: 0 },
            March: { type: Number, default: 0 },
            April: { type: Number, default: 0 },
            May: { type: Number, default: 0 },
            June: { type: Number, default: 0 },
            July: { type: Number, default: 0 },
            August: { type: Number, default: 0 },
            September: { type: Number, default: 0 },
            October: { type: Number, default: 0 },
            November: { type: Number, default: 0 },
            December: { type: Number, default: 0 }
        }
    }],
    salaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salary'}
}, { timestamps: true });

fulltimeCaptainSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('FulltimeCaptain', fulltimeCaptainSchema);