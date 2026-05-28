const xlsx = require('xlsx');
const Municipality = require('../../../models/municipality.model');
const County = require('../../../models/county.model');
const BaseController = require('../_base.controller');
const MunicipalityRepository = require('../../../repositories/municipality.repository');
const BaseResponse = require('../../responses/_base.response');

class MunicipalityController extends BaseController {

    constructor() {
        super();
        this._municipalityRepository = MunicipalityRepository;
    }


    getMunicipalities = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            const result = await this._municipalityRepository.paginate({
                pageNumber: parseInt(req.query.page) || 1,
                pageSize: parseInt(req.query.limit) || 100,
                populate: [{ path: 'county', select: 'name' }],
                sort: { field: 'name', order: 1 }
            });
            return response.okResponse(result);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    async importMunicipalities(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });
            }

            const workbook = xlsx.read(req.file.buffer, {
                type: 'buffer'
            });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet, {
                defval: "" // Ensure empty cells are just empty strings, not undefined
            });

            if (data.length > 0) {
                console.log("First row keys:", Object.keys(data[0]));
            }

            let createdCount = 0;
            let updatedCount = 0;

            for (const row of data) {
                // Clean up keys
                const cleanRow = {};
                Object.keys(row).forEach(key => {
                    cleanRow[key.trim()] = row[key];
                });

                // Expected headers: Municipality, County, County Code, Federal Code
                const municipalityName = cleanRow['Municipality'];
                const countyName = cleanRow['County'];
                const countyCode = cleanRow['County Code'];
                const federalCode = cleanRow['Federal Code'];

                if (!municipalityName || !countyName) {
                    continue; // Skip invalid rows
                }

                // Find or create County
                let county = await County.findOne({
                    name: new RegExp('^' + countyName + '$', "i")
                });

                if (!county) {
                    county = await County.create({
                        name: countyName
                    });
                }

                // Find or create Municipality
                let municipality = await Municipality.findOne({
                    federalCode: federalCode
                });

                // Fallback to name check if federal code is missing or not found
                if (!municipality && !federalCode) {
                    municipality = await Municipality.findOne({
                        name: new RegExp('^' + municipalityName + '$', "i"),
                        county: county._id
                    });
                }

                if (municipality) {
                    municipality.name = municipalityName;
                    municipality.county = county._id;
                    municipality.countyCode = countyCode;
                    municipality.federalCode = federalCode;
                    await municipality.save();
                    updatedCount++;
                } else {
                    await Municipality.create({
                        name: municipalityName,
                        county: county._id,
                        countyCode: countyCode,
                        federalCode: federalCode
                    });
                    createdCount++;
                }
            }

            return res.status(200).json({
                success: true,
                message: "Import finished",
                data: {
                    created: createdCount,
                    updated: updatedCount
                }
            });

        } catch (error) {
            console.error("Import error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
}

module.exports = new MunicipalityController();
