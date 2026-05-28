/* Third Party Libraries */
const _ = require("lodash");
const db = require('mongoose')
const s3 = require("../../config/s3.config");
const {
    check,
    validationResult
} = require("express-validator");
/* Third Party Libraries */

/* Responses */
const FileResponse = require("../responses/file.response")
/* End Responses */

/* Exceptions */
const BadRequestError = require("../../exceptions/badRequest.exception");
/* End Exceptions */

/* Models */
/* End Models */

class FileController {

    expectedFiles() {
        return [
            'proofOfRabies',
            'tagPicture',
            'files'
        ]
    }


    async uploadFiles(req, res) {
        const response = new FileResponse(req, res)
        try {
            if (!req['files'] || _.isEmpty(req['files'])) {
                throw new Error('Files required');
            }
            const files = Object.keys(req.files)
                .map(key => {
                    console.log(req.files[key])
                    // return { [key]: req.files[key].map(file => file.filename) }; // For local storage
                    return { [key]: req.files[key].map(file => file.key) }; // For S3 Storage
                })
                .reduce((prev, curr) => {
                    return { ...prev, ...curr }
                });
            return response.postDataResponse(files);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }


}

module.exports = new FileController();
