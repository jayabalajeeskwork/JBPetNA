const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SuperAdminProfileSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    fullName: String

}, {
    timestamps: true
});

module.exports = mongoose.model(
    'SuperAdminProfile',
    SuperAdminProfileSchema
);