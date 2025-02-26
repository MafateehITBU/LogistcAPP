const express = require('express');
const router = express.Router();
const {sendMessage, getMessages, getConversations, markLastMessageAsRead } = require('../controllers/chatController');

router.post('/send', sendMessage); // Send a message
router.get('/:conversationId/messages', getMessages); // Get messages in a conversation
router.get('/user/:userId', getConversations); // Get conversations for a user/admin/captain
router.put('/:conversationId/mark-read', markLastMessageAsRead); // Mark a message as read

module.exports = router;
