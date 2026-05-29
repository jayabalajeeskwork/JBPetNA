const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ServiceProviderProfileSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    businessName: String,

    businessAddress: String,

    contactPerson: String,

    municipality: {
        type: Schema.Types.ObjectId,
        ref: 'Municipality'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    'ServiceProviderProfile',
    ServiceProviderProfileSchema
);