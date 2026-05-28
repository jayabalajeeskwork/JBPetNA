const BaseRepository = require('./_base.repository');
const PetModel = require('../models/pet.model');

module.exports = class PetRepository extends BaseRepository {
    constructor() {
        super()
    }

    getModel() {
        return PetModel;
    }
}
