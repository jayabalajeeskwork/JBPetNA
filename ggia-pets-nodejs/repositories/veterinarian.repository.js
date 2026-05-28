const BaseRepository = require('./_base.repository');
const VeterinarianModel = require('../models/veterinarian.model');

class VeterinarianRepository extends BaseRepository {

    constructor() {
        super();
    }

    getModel() {
        return VeterinarianModel;
    }
}

module.exports = new VeterinarianRepository();
