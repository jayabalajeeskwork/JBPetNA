const repositories = require('../../repositories')
const _ = require('lodash');

module.exports = class BaseController {
    constructor() {
        this._userRepository = new repositories.UserRepository();
    }

    getRepository(name) {
        if (repositories[name]) {
            return new repositories[name];
        }

        throw new Error('Repository not found.')
    }

    getService(name) {
        if (services[name]) {
            return services[name];
        }

        throw new Error('Service not found.')
    }
}
