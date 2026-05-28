const BaseController = require('../_base.controller');
const CountyRepository = require('../../../repositories/county.repository');
const BaseResponse = require('../../responses/_base.response');

class CountyController extends BaseController {

    constructor() {
        super();
        this._countyRepository = CountyRepository;
        this._repository = CountyRepository; // For BaseController methods if any
    }

    getCounties = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            const result = await this._countyRepository.paginate({
                pageNumber: parseInt(req.query.page) || 1,
                pageSize: parseInt(req.query.limit) || 100,
                sort: { field: 'name', order: 1 }
            });
            return response.okResponse(result);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }
}

module.exports = new CountyController();
