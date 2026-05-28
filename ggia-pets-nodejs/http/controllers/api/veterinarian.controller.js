const xlsx = require('xlsx');
const Veterinarian = require('../../../models/veterinarian.model');
const BaseController = require('../_base.controller');
const VeterinarianRepository = require('../../../repositories/veterinarian.repository');
const BaseResponse = require('../../responses/_base.response');

class VeterinarianController extends BaseController {

    constructor() {
        super();
        this._veterinarianRepository = VeterinarianRepository;
    }

    getVeterinarians = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            const filters = {};
            if (req.query.search) {
                filters.match = {
                    $or: [
                        { fullName: { $regex: req.query.search, $options: 'i' } },
                        { licenseNumber: { $regex: req.query.search, $options: 'i' } },
                        { city: { $regex: req.query.search, $options: 'i' } }
                    ]
                };
            }

            const result = await this._veterinarianRepository.paginate({
                pageNumber: parseInt(req.query.page) || 1,
                pageSize: parseInt(req.query.limit) || 100,
                filters: filters,
                sort: { field: 'fullName', order: 1 }
            });
            return response.okResponse(result);
        } catch (e) {
            return response.internalServerErrorResponse(e);
        }
    }

    async importVeterinarians(req, res) {
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

                // Expected headers: Full Name, License Number, Profession, License Type, License Status, City, State
                const fullName = cleanRow['Full Name'];
                const licenseNumber = cleanRow['License Number'];
                const profession = cleanRow['Profession'];
                const licenseType = cleanRow['License Type'];
                const licenseStatus = cleanRow['License Status'];
                const city = cleanRow['City'];
                const state = cleanRow['State'];

                if (!fullName || !licenseNumber) {
                    continue; // Skip invalid rows without name or license number
                }

                // Find or create Veterinarian
                let veterinarian = await Veterinarian.findOne({
                    licenseNumber: licenseNumber
                });

                if (veterinarian) {
                    veterinarian.fullName = fullName;
                    veterinarian.profession = profession;
                    veterinarian.licenseType = licenseType;
                    veterinarian.licenseStatus = licenseStatus;
                    veterinarian.city = city;
                    veterinarian.state = state;
                    await veterinarian.save();
                    updatedCount++;
                } else {
                    await Veterinarian.create({
                        fullName: fullName,
                        licenseNumber: licenseNumber,
                        profession: profession,
                        licenseType: licenseType,
                        licenseStatus: licenseStatus,
                        city: city,
                        state: state
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

module.exports = new VeterinarianController();
