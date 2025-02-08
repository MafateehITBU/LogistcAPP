const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Captain = require('../models/FreelanceCaptain');
const FulltimeCaptin = require('../models/FulltimeCaptain');
const Car = require('../models/Car');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Sign-up controller with profile picture upload
exports.signup = [
    upload.fields([
        { name: 'profilePic'},
        { name: 'civilIdCardFront'},
        { name: 'civilIdCardBack'},
        { name: 'driverLicense'},
        { name: 'vehicleLicense'},
        { name: 'policeClearanceCertificate'},
    ]),
    asyncHandler(async (req, res) => {
        try {
            const { name, email, password, phone, shift, car_palette, car_type, manufactureYear, licenseExpiryDate, insuranceType, carOwnership } = req.body;
            const lowercaseEmail = email.toLowerCase();

            // Upload files to Cloudinary
            const uploadFile = async (file) => {
                const result = await cloudinary.uploader.upload(file.path);
                fs.unlinkSync(file.path); // Delete local file after upload
                return result.secure_url;
            };

            const profilePictureUrl = req.files.profilePic ? await uploadFile(req.files.profilePic[0]) : null;
            const civilIdCardFrontUrl = req.files.civilIdCardFront ? await uploadFile(req.files.civilIdCardFront[0]) : null;
            const civilIdCardBackUrl = req.files.civilIdCardBack ? await uploadFile(req.files.civilIdCardBack[0]) : null;
            const driverLicenseUrl = req.files.driverLicense ? await uploadFile(req.files.driverLicense[0]) : null;
            const vehicleLicenseUrl = req.files.vehicleLicense ? await uploadFile(req.files.vehicleLicense[0]) : null;
            const policeClearanceCertificateUrl = req.files.policeClearanceCertificate ? await uploadFile(req.files.policeClearanceCertificate[0]) : null;

            // Ensure all files are uploaded
            // if (!civilIdCardFrontUrl || !civilIdCardBackUrl || !driverLicenseUrl || !vehicleLicenseUrl || !policeClearanceCertificateUrl) {
            //     return res.status(400).json({ error: 'All required documents must be uploaded.' });
            // }

            // Create the car
            const car = new Car({
                car_palette,
                car_type,
                manufactureYear,
                licenseExpiryDate,
                insuranceType,
                carOwnership,
            });
            const createdCar = await car.save();

            // Create the captain and associate the car ID
            const captain = new Captain({
                name,
                email: lowercaseEmail,
                password,
                phone,
                shift,
                profilePicture: profilePictureUrl, // Save the picture URL
                car: createdCar._id,
                civilIdCardFront: civilIdCardFrontUrl,
                civilIdCardBack: civilIdCardBackUrl,
                driverLicense: driverLicenseUrl,
                vehicleLicense: vehicleLicenseUrl,
                policeClearanceCertificate: policeClearanceCertificateUrl,
            });
            await captain.save();

            res.status(201).json({
                message: 'Captain created successfully with car and documents',
                captain,
                car: createdCar,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
];

// Sign-in controller
exports.signin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const lowercaseEmail = email.toLowerCase();
    const captain = await Captain.findOne({ email: lowercaseEmail });
    if (!captain) return res.status(404).json({ error: 'Captain not found' });

    const isMatch = await bcrypt.compare(password, captain.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    if (captain.accountStatus !== 'approved') {
        return res.status(403).json({ error: 'Captain profile is not approved yet!' });
    }

    const token = jwt.sign({ captainId: captain.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Sign-in successful', token });
});

// Get All Captains controller
exports.getAllCaptains = asyncHandler(async (req, res) => {
    const captains = await Captain.find();
    res.status(200).json(captains);
});

// Get a single Captain controller
exports.getCaptain = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const captain = await Captain.findById(id);
    if (!captain) return res.status(404).json({ error: 'Captain not found' });
    res.status(200).json(captain);
});

// Update captain controller
exports.updateCaptain = [
    upload.single("profilePic"),
    asyncHandler(async (req, res) => {
        const id = req.captain._id;
        let updates = req.body;

        console.log("Updating Captain ID:", id);
        console.log("Updates:", updates);

        try {
            // Check if a file is uploaded for profilePic
            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path);
                updates.profilePicture = result.secure_url;

                // Delete file from local storage after upload
                if (req.file.path) {
                    fs.unlinkSync(req.file.path);
                }
            }

            // Find and update the captain
            const captain = await Captain.findByIdAndUpdate(id, updates, { new: true }) ||
                await FreelanceCaptain.findByIdAndUpdate(id, updates, { new: true });

            if (!captain) {
                return res.status(404).json({ error: "Captain not found" });
            }

            res.status(200).json({ message: "Captain updated successfully", captain });
        } catch (error) {
            console.error("Update Captain Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }),
];

// Update account status by Admin
exports.updateAccountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountStatus } = req.body;

        // Allowed status updates for Admin
        const allowedStatuses = ['pending', 'approved', 'incomplete', 'rejected'];

        // Check if the provided status is valid
        if (!allowedStatuses.includes(accountStatus)) {
            return res.status(400).json({
                message: `Invalid status. Admin can only change status to ${allowedStatuses.join(', ')}`
            });
        }

        // Find the captain by ID
        const captain = await Captain.findById(id);
        if (!captain) {
            return res.status(404).json({ message: 'captain not found' });
        }

        // Update the status
        captain.accountStatus = accountStatus;
        await captain.save();

        res.status(200).json({
            message: 'captain status updated successfully',
            captain
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
// Delete captain controller
exports.deleteCaptain = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const captain = await Captain.findByIdAndDelete(id);
    if (!captain) return res.status(404).json({ error: 'Captain not found' });
    res.status(200).json({ message: 'Captain deleted successfully' });
});

// Get all delivery Cpatains
exports.getDeliveryCaptains = asyncHandler(async (req, res) => {
    try {
        const freelanceCaptains = await Captain.find();
        const fulltimeCaptains = await FulltimeCaptin.find({ role: "delivery" });

        // Combine both arrays
        const allDeliveryCaptains = [...freelanceCaptains, ...fulltimeCaptains];

        res.status(200).json({
            message: "Delivery captains retrieved successfully",
            deliveryCaptains: allDeliveryCaptains,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});