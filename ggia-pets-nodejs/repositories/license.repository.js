const BaseRepository = require('./_base.repository');
const LicenseModel = require('../models/license.model');

module.exports = class LicenseRepository extends BaseRepository {
    constructor() {
        super()
    }

    getModel() {
        return LicenseModel;
    }
}
