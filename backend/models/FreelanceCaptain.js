const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const freelanceCaptainSchema = mongoose.Schema({
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
        default: 'delivery',
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
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    },
    civilIdCardFront: {
        type: String,
        required: true,
    },
    civilIdCardBack: {
        type: String,
        required: true,
    },
    driverLicense: {
        type: String,
        required: true,
    },
    vehicleLicense: {
        type: String,
        required: true,
    },
    policeClearanceCertificate: {
        type: String,
        required: true,
    }
}, { timestamps: true });

freelanceCaptainSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.models.FreelanceCaptain || mongoose.model('FreelanceCaptain', freelanceCaptainSchema);
