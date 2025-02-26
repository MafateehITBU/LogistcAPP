const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createServer } = require("http");
const { Server } = require("socket.io");

const userRoutes = require('./routes/userRoutes');
const carRoutes = require('./routes/carRoutes');
const inventoryItemRoutes = require('./routes/inventoryItemRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fulltimeCaptainRoutes = require('./routes/fulltimeCaptainRoutes');
const freelanceCaptainRoutes = require('./routes/freelanceCaptainRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userItemsRoutes = require('./routes/userItemsRoutes')
const salaryRoutes = require('./routes/salaryRoutes');
const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Database connection error:', err));

// Socket.io connection
io.on("connection", (socket) => {
    console.log("A client connected");

    socket.on("disconnect", () => {
        console.log("A client disconnected");
    });
});

// Pass `io` to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/user', userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/car", carRoutes);
app.use("/api/inventoryItems", inventoryItemRoutes);
app.use("/api/fulltimeCaptain", fulltimeCaptainRoutes);
app.use("/api/freelanceCaptain", freelanceCaptainRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/userItems', userItemsRoutes);
app.use('/api/ticket', ticketRoutes);
app.use('/api/reward', rewardRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/chat', chatRoutes)
app.use(errorHandler);

const port = process.env.PORT || 8081;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});