const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MunicipalityProfileSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    fullName: {
        type: String,
        required: true
    },

    municipalities: [{
        type: Schema.Types.ObjectId,
        ref: 'Municipality'
    }]

}, {
    timestamps: true
});

module.exports = mongoose.model(
    'MunicipalityProfile',
    MunicipalityProfileSchema
);