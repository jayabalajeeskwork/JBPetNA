
const BaseRepository = require('./_base.repository');
const MunicipalityModel = require('../models/municipality.model');

class MunicipalityRepository extends BaseRepository {

    constructor() {
        super();
    }

    getModel() {
        return MunicipalityModel;
    }
}

module.exports = new MunicipalityRepository();
