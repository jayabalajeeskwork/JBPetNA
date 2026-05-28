const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { petType: PET_TYPES, petSex: PET_SEX } = require('../helpers/constants');

const PetModel = new Schema({
    name: {
        type: String,
        default: null
    },
    type: { // Dog or Cat
        type: Number,
        enum: Object.values(PET_TYPES || {}), // Fallback if constants not yet updated
        default: 1 // Assuming 1 is Dog
    },
    sex: {
        type: Number,
        enum: Object.values(PET_SEX || {}),
        default: 1
    },
    breed: {
        type: [String],
        default: []
    },
    age: {
        type: Number,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'PetOwner',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Pet', PetModel);
