const BaseRepository = require('./_base.repository');
const PetOwnerModel = require('../models/pet-owner.model');

module.exports = class PetOwnerRepository extends BaseRepository {
    constructor() {
        super()
    }

    getModel() {
        return PetOwnerModel;
    }
}
