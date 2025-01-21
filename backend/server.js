const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const carRoutes = require('./routes/carRoutes');
const fulltimeCaptainRoutes = require('./routes/fulltimeCaptainRoutes');
const freelanceCaptainRoutes = require('./routes/freelanceCaptainRoutes');

const errorHandler = require('./middlewares/errorHandler');


const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Database connection error:', err));


// Routes
app.use('/api/user', userRoutes);
app.use("/api/admin", require('./routes/adminRoutes'));
app.use("/api/car", carRoutes);
app.use("/api/fulltimeCaptain", fulltimeCaptainRoutes);
app.use("/api/freelanceCaptain", freelanceCaptainRoutes);
app.use(errorHandler);

const port = process.env.PORT || 8081;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});