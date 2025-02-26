const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel' // Dynamically references Admin, User, or Captains
    },
    senderModel: { type: String, enum: ['Admin', 'User', 'FulltimeCaptain', 'FreelanceCaptain'], required: true },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
