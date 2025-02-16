const Ticket = require('../models/Ticket');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const asyncHandler = require('express-async-handler');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Temporary upload folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Create ticket controller
exports.createTicket = [
    upload.single('file'),
    asyncHandler(async (req, res) => {
        console.log('User:', req.user);  // Log user object
        console.log('Captain:', req.captain);  // Log captain object

        const { name, title, description } = req.body;
        let userId;
        let role;

        if (req.user) {
            userId = req.user._id;
            role = "user";
        } else {
            userId = req.captain._id;
            role = "captain";
        }

        if (!userId) {
            return res.status(400).json({ message: 'User or Captain not authenticated' });
        }

        let fileUrl = null;
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path);
            fileUrl = uploadResult.secure_url;
            fs.unlinkSync(req.file.path); // Delete local file after upload
        }

        const ticket = new Ticket({
            userId,
            role,
            name,
            title,
            description,
            file: fileUrl
        });

        await ticket.save();
        
        // Emit a notification for the new order
        req.io.emit("newTicket", {
            message: `New ticket received`,
            createdAt: ticket.createdAt,
        });
        res.status(201).json({
            message: 'Ticket created successfully',
            ticket
        });
    })
];

// Get all tickets controller
exports.getAllTickets = asyncHandler(async (req, res) => {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
});

// Get all User tickets controller
exports.getUserTickets = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const tickets = await Ticket.find({ userId: userId });
    res.status(200).json(tickets);
});

// Get a single ticket by ID
exports.getTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findById(id);
        if (!ticket) return res.status(404).json({ error: 'ticket not found' });
        res.status(200).json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update ticket status and reply controller
exports.updateTicket = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, reply } = req.body;

    // Validate ticket exists
    const ticket = await Ticket.findById(id);
    if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
    }

    // Update ticket fields (status and reply)
    if (status) ticket.status = status;
    if (reply) ticket.reply = reply;

    // Save the updated ticket
    await ticket.save();

    // Return the updated ticket
    res.status(200).json({
        message: 'Ticket updated successfully',
        ticket
    });
});


// Delete a single ticket by ID controller
exports.deleteTicket = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) return res.status(404).json({ error: 'ticket not found' });
    res.status(200).json({ message: 'Ticket deleted successfully' });
});