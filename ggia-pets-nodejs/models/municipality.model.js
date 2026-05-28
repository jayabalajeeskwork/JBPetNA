const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MunicipalityModel = new Schema({
    name: {
        type: String,
        required: true
    },
    county: {
        type: Schema.Types.ObjectId,
        ref: 'County',
        required: true
    },
    countyCode: {
        type: String,
        default: null
    },
    federalCode: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Municipality', MunicipalityModel);
