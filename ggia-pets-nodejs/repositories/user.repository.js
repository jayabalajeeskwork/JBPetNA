const BaseRepository = require('./_base.repository');
const UserModel = require('../models/user.model');

module.exports = class UserRepository extends BaseRepository {
    constructor() {
        super()
    }

    getModel() {
        return UserModel;
    }

    async findByToken(token) {
        return UserModel.findByToken(token).session(this._session);
    }

    async refreshToken(user) {
        return UserModel.refreshToken(user);
    }
}
