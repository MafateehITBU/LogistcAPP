const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    car_palette: {
        type: String,
        required: true,
    },
    car_type: {
        type: String,
        required: true,
    }
},{ timestamps: true });

module.exports = mongoose.model('Car', carSchema);