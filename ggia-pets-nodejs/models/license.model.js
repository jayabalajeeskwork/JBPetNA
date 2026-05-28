const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LicenseModel = new Schema({
    pet: {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'PetOwner',
        required: true
    },
    acknowledgment: {
        type: Schema.Types.ObjectId,
        ref: 'Acknowledgment',
        required: true
    },
    color: {
        type: String,
        default: null
    },
    hairLength: {
        type: String,
        default: null
    },
    spayedNeutered: {
        type: Boolean,
        default: null
    },
    vetName: {
        type: String,
        default: null
    },
    vetAddress: {
        type: String,
        default: null
    },
    vetPhone: {
        type: String,
        default: null
    },
    rabiesVaccinationReport: { // URL to image
        type: String,
        default: null
    },
    licenseCertificate: {
        type: String,
        default: null
    },
    licenseConfirmation: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('License', LicenseModel);
