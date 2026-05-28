
const BaseRepository = require('./_base.repository');
const CountyModel = require('../models/county.model');

class CountyRepository extends BaseRepository {

    constructor() {
        super();
    }

    getModel() {
        return CountyModel;
    }
}

module.exports = new CountyRepository();
