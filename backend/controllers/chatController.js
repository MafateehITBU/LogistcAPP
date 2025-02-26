const asyncHandler = require('express-async-handler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
let io;

const setSocketIoInstance = (ioInstance) => {
    io = ioInstance;
};

// Helper: to fetch sender details dynamically
const getSenderDetails = async (senderId, senderModel) => {
    let senderName = "Unknown";
    let profilePicture = "";

    const models = {
        User: require("../models/User"),
        FulltimeCaptain: require("../models/FulltimeCaptain"),
        FreelanceCaptain: require("../models/FreelanceCaptain"),
        Admin: require("../models/Admin"),
    };

    const Model = models[senderModel];
    if (Model) {
        const sender = await Model.findById(senderId).select("name profilePicture");
        if (sender) {
            senderName = sender.name || senderName;
            profilePicture = sender.profilePicture || profilePicture;
        }
    }

    return { senderName, profilePicture };
};

// Send a message (creates a conversation if not found)
const sendMessage = asyncHandler(async (req, res) => {
    const { senderId, senderModel, receiverId, receiverModel, text } = req.body;

    // Check if a conversation already exists
    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
        conversation = new Conversation({
            participants: [senderId, receiverId],
            participantsModel: [senderModel, receiverModel],
        });
        await conversation.save();
    }

    // Create and send the message
    const message = new Message({
        conversationId: conversation._id,
        sender: senderId,
        senderModel,
        text,
    });

    let createdMsg = await message.save();

    // Fetch sender details
    const { senderName, profilePicture } = await getSenderDetails(senderId, senderModel);

    // Update last message in conversation
    await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: createdMsg.id,
        lastMessageAt: Date.now(),
    });

    // Emit real-time message notification
    req.io.emit("newMessage", {
        message: createdMsg,
        senderName,
        profilePicture,
        conversation: conversation._id,
        createdAt: createdMsg.createdAt,
    });

    res.status(201).json({ ...createdMsg.toObject(), senderName, conversationId: conversation._id });
});


// Get Messages in a Conversation
const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    res.status(200).json(messages);
});

// Get All Conversations for a User, Captain, or Admin
const getConversations = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const conversations = await Conversation.find({ participants: userId })
        .populate('participants', 'name profilePicture')
        .populate('lastMessage')
        .sort({ lastMessageAt: -1 });

    res.status(200).json(conversations);
});

// Mark Last Message as Read
const markLastMessageAsRead = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    // Find the conversation
    const conversation = await Conversation.findById(conversationId).populate('lastMessage');

    if (!conversation || !conversation.lastMessage) {
        return res.status(404).json({ message: "Conversation or last message not found" });
    }

    // Update last message to read
    const lastMessage = await Message.findByIdAndUpdate(
        conversation.lastMessage._id,
        { read: true },
        { new: true }
    );

    res.status(200).json({ message: "Message marked as read" });
});


module.exports = { setSocketIoInstance, sendMessage, getMessages, getConversations, markLastMessageAsRead};
