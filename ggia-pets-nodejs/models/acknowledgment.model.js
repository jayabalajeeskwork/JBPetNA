const { acknowledgmentType, acknowlegementStatus } = require('../helpers/constants');
const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const AcknowledgmentModel = new Schema({
    sendLinkVia: {
        type: String,
        enum: ['email', 'mobile'],
        default: null
    },
    formType: {
        type: Number,
        enum: Object.values(acknowledgmentType),
        required: true
    },
    isFormCompleted: {
        type: Boolean,
        default: false
    },
    isLicense: {
        type: Boolean,
        default: false
    },
    isLicenseFilled: {
        type: Boolean,
        default: false
    },
    proofOfRabies: { // URL to image
        type: String,
        default: null
    },
    tagPicture: { // URL to image
        type: String,
        default: null
    },
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
    groomerIds: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    groomerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: Number,
        default: acknowlegementStatus.PENDING
    },
    token: {
        type: String,
        default: null
    },
    unstractStatus: {
        type: String,
        default: null
    },
    unstractStatusApi: {
        type: String,
        default: null
    },
    fileExecutionId: {
        type: String,
        default: null
    },
    sourceHash: {
        type: String,
        default: null
    },
    acknowledgmentId: {
        type: String,
        default: null
    },
    licenseOption: {
        type: String,
        enum: ['license_exists', 'through_ggia', 'municipality_site'],
        default: 'license_exists'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Acknowledgment', AcknowledgmentModel);
