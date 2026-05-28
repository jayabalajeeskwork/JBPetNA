const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VeterinarianModel = new Schema({
    fullName: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    profession: {
        type: String,
        default: null
    },
    licenseType: {
        type: String,
        default: null
    },
    licenseStatus: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    state: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Veterinarian', VeterinarianModel);
