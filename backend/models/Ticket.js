const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved'],
        default: 'open',
    }
}, {timestamps: true});

module.exports = mongoose.model('Ticket', ticketSchema);