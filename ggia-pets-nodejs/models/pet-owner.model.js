const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PetOwnerSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    name: {
        type: String,
        default: null
    },

    municipality: {
        type: Schema.Types.ObjectId,
        ref: 'Municipality',
        default: null
    },

    county: {
        type: Schema.Types.ObjectId,
        ref: 'County',
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('PetOwner', PetOwnerSchema);