const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PetOwnerModel = new Schema({
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    phone: {
        type: String,
        default: null,
        index: true
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

module.exports = mongoose.model('PetOwner', PetOwnerModel);
