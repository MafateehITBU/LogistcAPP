const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    role: {
        type: String,
        enum: ['user', 'captain'],
    },
    name: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    }, 
    description: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: false,
    },
    reply: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'closed'],
        default: 'open',
    }
}, {timestamps: true});

module.exports = mongoose.model('Ticket', ticketSchema);