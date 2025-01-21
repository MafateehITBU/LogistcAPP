const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    car_palette: {
        type: String,
        required: true,
    },
    car_type: {
        type: String,
        required: true,
    },
    manufactureYear: {
        type: String,
        required: true,
    },
    licenseExpiryDate: {
        type: String,
        required: true,
    },
    insuranceType: {
        type: String,
        enum: ['comprehensive', 'thirdPartyLiability', 'partial'],
        required: true,
    },
    carOwnership: {
        type: String,
        enum: ['company', 'captain'],
        required: true,
    }
},{ timestamps: true });

module.exports = mongoose.model('Car', carSchema);