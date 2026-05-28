const BaseRepository = require('./_base.repository');
const AcknowledgmentModel = require('../models/acknowledgment.model');

module.exports = class AcknowledgmentRepository extends BaseRepository {
    constructor() {
        super()
    }

    getModel() {
        return AcknowledgmentModel;
    }
}
