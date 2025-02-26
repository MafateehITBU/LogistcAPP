const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'participantsModel' // Can be Admin, User, or Captains 
    }],
    participantsModel: [{ type: String, enum: ['Admin', 'User', 'FulltimeCaptain', 'FreelanceCaptain'], required: true }], // Stores models
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message"},
    lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);