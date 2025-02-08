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
        default: 'pending',
        enum: ['pending', 'approved', 'incomplete', 'rejected']
    }
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