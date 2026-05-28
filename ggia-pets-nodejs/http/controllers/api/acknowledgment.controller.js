const BaseController = require('../_base.controller');
const BaseResponse = require('../../responses/_base.response');
const AcknowledgmentRepository = require('../../../repositories/acknowledgment.repository');
const PetOwnerRepository = require('../../../repositories/pet-owner.repository');
const PetRepository = require('../../../repositories/pet.repository');
const LicenseRepository = require('../../../repositories/license.repository');
const UserRepository = require('../../../repositories/user.repository');
const { acknowledgmentType, petType, petSex } = require('../../../helpers/constants');
const BadRequestError = require('../../../exceptions/badRequest.exception');
const helpers = require('../../../helpers/helpers');
const crypto = require('crypto');
const axios = require('axios');

class AcknowledgmentController extends BaseController {

    constructor() {
        super();
        this._acknowledgmentRepository = new AcknowledgmentRepository();
        this._petOwnerRepository = new PetOwnerRepository();
        this._petRepository = new PetRepository();
        this._licenseRepository = new LicenseRepository();
        this._userRepository = new UserRepository();
    }

    submit = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            let {
                type,
                acknowledgementId,
            } = req.body;

            let acknowledgment = await this._acknowledgmentRepository.findById(acknowledgementId);
            if (!acknowledgment) {
                throw new BadRequestError('Acknowledgment not found');
            }

            let apiResponse = null;

            if (type === acknowledgmentType.OWNER_INFO) {
                let {
                    name,
                    phone,
                    municipality,
                    county,
                    email
                } = req.body;

                const ownerPayload = {
                    name,
                    phone,
                    municipality,
                    county
                };
                if (email && typeof email === 'string' && email.trim() !== '') {
                    ownerPayload.email = email.trim();
                }

                if (ownerPayload.email) {
                    const existingWithEmail = await this._petOwnerRepository.findOne({
                        email: ownerPayload.email,
                        _id: { $ne: acknowledgment.owner }
                    });
                    if (existingWithEmail) {
                        throw new BadRequestError('An owner with this email address already exists.');
                    }
                }

                let owner = await this._petOwnerRepository.findById(acknowledgment.owner);
                if (owner) {
                    owner = await this._petOwnerRepository.updateById(owner._id, ownerPayload, { new: true });
                } else {
                    owner = await this._petOwnerRepository.create(ownerPayload);

                    await this._acknowledgmentRepository.updateById(acknowledgementId, {
                        owner: owner._id
                    }, { new: true });
                }
                apiResponse = owner;
            } else if (type === acknowledgmentType.PET_INFO) {
                let {
                    name,
                    petType,
                    sex,
                    breed,
                    age,
                    address
                } = req.body;

                let pet;
                if (acknowledgment && acknowledgment.pet) {
                    pet = await this._petRepository.updateById(acknowledgment.pet, {
                        name,
                        type: petType,
                        sex,
                        breed,
                        age,
                        address,
                        owner: acknowledgment.owner
                    }, { new: true });
                } else {
                    pet = await this._petRepository.create({
                        name,
                        type: petType,
                        sex,
                        breed,
                        age,
                        address,
                        owner: acknowledgment ? acknowledgment.owner : null
                    });
                    if (acknowledgment) {
                        await this._acknowledgmentRepository.updateById(acknowledgementId, {
                            pet: pet._id
                        }, { new: true });
                    }
                }
                apiResponse = pet;
            } else if (type === acknowledgmentType.LICENSE) {
                let {
                    isLicense,
                    proofOfRabies,
                    tagPicture
                } = req.body;

                acknowledgment = await this._acknowledgmentRepository.updateById(acknowledgementId, {
                    isLicense,
                    proofOfRabies,
                    tagPicture
                }, { new: true });

                apiResponse = acknowledgment;
            }

            // Centralized form type update
            if (apiResponse && acknowledgment.formType < type) {
                await this._acknowledgmentRepository.updateById(acknowledgementId, {
                    formType: type,
                }, { new: true });
            }

            return response.sendResponse(apiResponse);

        } catch (error) {
            return response.internalServerErrorResponse(error);
        }
    }

    submitLicenseDetails = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            let {
                acknowledgementId,
                licenseOption,
                color,
                hairLength,
                spayedNeutered,
                vetName,
                vetAddress,
                vetPhone,
                rabiesVaccinationReport,
                licenseCertificate,
                licenseConfirmation,
            } = req.body;

            let acknowledgment = await this._acknowledgmentRepository.findById(acknowledgementId);
            if (!acknowledgment) {
                throw new BadRequestError('Acknowledgment not found');
            }


            let license = await this._licenseRepository.findOne({ acknowledgment: acknowledgementId });
            let payload = {
                pet: acknowledgment.pet,
                owner: acknowledgment.owner,
                acknowledgment: acknowledgementId,
                color,
                hairLength,
                spayedNeutered,
                vetName,
                vetAddress,
                vetPhone,
                rabiesVaccinationReport,
                licenseCertificate,
                licenseConfirmation,
            };

            if (license) {
                license = await this._licenseRepository.updateById(license._id, payload, { new: true });
            } else {
                license = await this._licenseRepository.create(payload);
            }

            await this._acknowledgmentRepository.updateById(acknowledgementId, {
                isLicenseFilled: true,
            });

            return response.sendResponse(license);

        } catch (error) {
            return response.internalServerErrorResponse(error);
        }
    }

    sendAcknowlegementLink = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            let {
                sendLinkVia,
                email,
                phone,
                petType,
                breed,
                age,
                address,
                ownerName
            } = req.body;

            if (sendLinkVia === 'sms') sendLinkVia = 'mobile';

            if (!sendLinkVia || (sendLinkVia === 'email' && !email) || (sendLinkVia === 'mobile' && !phone)) {
                throw new BadRequestError('Invalid contact information providing for sendLinkVia');
            }

            // Find or create owner
            let owner;
            if (sendLinkVia === 'email') {
                owner = await this._petOwnerRepository.findOne({ email });
                if (owner) {
                    throw new BadRequestError('Owner with this email already exists.');
                }
                let createdObj = { email };
                if (ownerName) createdObj.name = ownerName;
                owner = await this._petOwnerRepository.create(createdObj);
            } else if (sendLinkVia === 'mobile') {
                owner = await this._petOwnerRepository.findOne({ phone });
                if (owner) {
                    throw new BadRequestError('Owner with this phone number already exists.');
                }
                let createdObj = { phone };
                if (ownerName) createdObj.name = ownerName;
                owner = await this._petOwnerRepository.create(createdObj);
            }

            if (!owner) {
                throw new BadRequestError('Failed to create or find owner');
            }

            // Find or create pet
            let petQuery = { owner: owner._id };
            if (petType) petQuery.type = petType;
            if (breed) petQuery.breed = breed;
            if (age) petQuery.age = age;
            if (address) petQuery.address = address;

            let pet = await this._petRepository.findOne(petQuery);
            if (!pet) {
                pet = await this._petRepository.create({
                    type: petType || 1, // Fallback to Dog if nothing provided
                    breed: breed || [],
                    age: age || null,
                    address: address || null,
                    owner: owner._id
                });
            }

            let groomerId = req.user ? req.user._id : req.body.userId;
            if (!groomerId) {
                throw new BadRequestError('User ID is required');
            }

            const token = crypto.randomBytes(32).toString('hex');

            const acknowledgmentId = helpers.generateAcknowledgmentId();

            let acknowledgment = await this._acknowledgmentRepository.create({
                acknowledgmentId,
                formType: acknowledgmentType.OWNER_INFO,
                sendLinkVia,
                pet: pet._id,
                owner: owner._id,
                groomerId,
                groomerIds: [groomerId],
                token
            });

            if (sendLinkVia === 'email' && email) {
                const link = `${process.env.FRONTEND_URL}/acknowledgment/${token}`;
                await helpers.sendAcknowledgmentEmail(email, link);
            } else if (sendLinkVia === 'mobile' && phone) {
                const link = `${process.env.FRONTEND_URL}/acknowledgment/${token}`;
                await helpers.sendAcknowledgmentSMS(phone, link);
            }

            return response.sendResponse(acknowledgment);
        } catch (error) {
            return response.internalServerErrorResponse(error);
        }
    }

    list = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            const {
                pageNumber = 1,
                pageSize = 20,
                status,
                sendLinkVia,
                search,
                startDate,
                endDate
            } = req.query;

            const aggregation = [];
            const filters = {
                match: {
                    groomerIds: req.user._id
                }
            };

            if (status !== undefined && status !== '') {
                filters.match.status = parseInt(status);
            }

            if (sendLinkVia) {
                filters.match.sendLinkVia = sendLinkVia;
            }

            if (startDate || endDate) {
                filters.match.createdAt = {};
                if (startDate) {
                    filters.match.createdAt.$gte = new Date(startDate);
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    filters.match.createdAt.$lte = end;
                }
            }

            const lookup = [
                {
                    $lookup: {
                        from: 'petowners',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'owner'
                    }
                },
                { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'pets',
                        localField: 'pet',
                        foreignField: '_id',
                        as: 'pet'
                    }
                },
                { $unwind: { path: '$pet', preserveNullAndEmptyArrays: true } }
            ];

            if (search) {
                lookup.push({
                    $match: {
                        $or: [
                            { 'owner.name': { $regex: search, $options: 'i' } },
                            { 'owner.email': { $regex: search, $options: 'i' } },
                            { 'owner.phone': { $regex: search, $options: 'i' } },
                            { 'pet.name': { $regex: search, $options: 'i' } }
                        ]
                    }
                });
            }

            const result = await this._acknowledgmentRepository.paginate({
                pageNumber: parseInt(pageNumber),
                pageSize: parseInt(pageSize),
                filters,
                lookup,
                sort: { field: 'createdAt', order: -1 }
            });

            return response.sendResponse(result);
        } catch (error) {
            return response.internalServerErrorResponse(error);
        }
    }

    searchOwner = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            const { email, phone } = req.query;
            if (!email && !phone) {
                throw new BadRequestError('Email or phone is required');
            }

            const query = {};
            if (email) query.email = email;
            if (phone) query.phone = phone;

            const owner = await this._petOwnerRepository.findOne(query);
            if (!owner) {
                return response.sendResponse(null);
            }

            const pets = await this._petRepository.find({ owner: owner._id });
            const lastAcknowledgment = await this._acknowledgmentRepository.findOne(
                { owner: owner._id },
                null,
                null,
                { createdAt: -1 }
            );

            if (!lastAcknowledgment) {
                return response.sendResponse(null);
            }

            return response.sendResponse({
                owner,
                pets,
                lastAcknowledgment
            });
        } catch (error) {
            return response.internalServerErrorResponse(error);
        }
    }

    addToDashboard = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            const { ownerId, userId } = req.body;
            if (!ownerId) {
                throw new BadRequestError('Owner ID is required');
            }

            let groomerId = req.user ? req.user._id : userId;
            if (!groomerId) {
                throw new BadRequestError('User ID is required');
            }

            const owner = await this._petOwnerRepository.findById(ownerId);
            if (!owner) {
                throw new BadRequestError('Owner not found');
            }

            let acknowledgment = await this._acknowledgmentRepository.findOne({ owner: ownerId });

            if (acknowledgment) {
                acknowledgment = await this._acknowledgmentRepository.updateById(acknowledgment._id, {
                    $addToSet: { groomerIds: groomerId }
                }, { new: true });
            } else {
                throw new BadRequestError('Acknowledgment not found for this owner. Please send a link first.');
            }

            return response.sendResponse(acknowledgment);
        } catch (error) {
            return response.internalServerErrorResponse(error);
        }
    }

    extractVaccineData = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            const { s3Url, acknowledgementId } = req.body;
            if (!s3Url) {
                throw new BadRequestError('S3 URL is required');
            }

            if (!acknowledgementId) {
                throw new BadRequestError('Acknowledgement ID is required');
            }

            const data = await helpers.extractVaccineDataFromUnstract(s3Url);

            // Based on prompt image, data.message contains execution_status and status_api
            const { execution_status, status_api } = data.message;

            await this._acknowledgmentRepository.updateById(acknowledgementId, {
                unstractStatus: execution_status,
                unstractStatusApi: status_api,
                proofOfRabies: s3Url  // Save the uploaded S3 URL immediately on first upload
            });

            return response.sendResponse(data);
        } catch (error) {
            return response.internalServerErrorResponse(error);
        }
    }

    getDetailsByToken = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            const { token } = req.params;
            if (!token) {
                throw new BadRequestError('Token is required');
            }

            const acknowledgment = await this._acknowledgmentRepository.findOne({ token }, null, [
                { path: 'pet' },
                { path: 'owner' },
                { path: 'groomerId', select: 'businessName businessAddress contactPerson' }
            ]);

            if (!acknowledgment) {
                return response.sendResponse(null);
            }

            const license = await this._licenseRepository.findOne({ acknowledgment: acknowledgment._id });

            return response.sendResponse({
                ...acknowledgment.toJSON(),
                license: license || null
            });
        } catch (error) {
            return response.internalServerErrorResponse(error);
        }
    }

    updateLicenseOption = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            const { acknowledgementId, licenseOption } = req.body;
            if (!acknowledgementId) {
                throw new BadRequestError('Acknowledgment ID is required');
            }

            if (!licenseOption) {
                throw new BadRequestError('License Option is required');
            }

            const acknowledgment = await this._acknowledgmentRepository.updateById(acknowledgementId, {
                licenseOption
            }, { new: true });

            if (!acknowledgment) {
                throw new BadRequestError('Acknowledgment not found');
            }

            return response.sendResponse(acknowledgment);

        } catch (error) {
            return response.internalServerErrorResponse(error);
        }
    }

    getUnstractStatus = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            const { acknowledgementId } = req.params;
            const acknowledgment = await this._acknowledgmentRepository.findById(acknowledgementId);

            if (!acknowledgment || !acknowledgment.unstractStatusApi) {
                throw new BadRequestError('No Unstract extraction process found for this acknowledgment');
            }

            // If already completed, return status
            if (acknowledgment.unstractStatus === 'COMPLETED') {
                return response.sendResponse({
                    status: acknowledgment.unstractStatus
                });
            }

            // Otherwise, poll Unstract API
            const baseUrl = process.env.UNSTRACT_API_BASE_URL || 'https://us-central.unstract.com';
            const pollUrl = `${baseUrl}${acknowledgment.unstractStatusApi}`;

            let pollData;
            try {
                const axiosResponse = await axios.get(pollUrl, {
                    headers: {
                        'Authorization': `Bearer ${process.env.UNSTRACT_API_KEY}`
                    }
                });
                pollData = axiosResponse.data;
            } catch (axiosError) {
                if (axiosError.response && axiosError.response.data) {
                    pollData = axiosError.response.data;
                } else {
                    throw axiosError;
                }
            }

            if (pollData && (pollData.status === 'COMPLETED' || pollData.message === 'Result already acknowledged')) {
                const message = pollData.message && Array.isArray(pollData.message) ? pollData.message[0] : null;
                const result = message && message.result && message.result.output && message.result.output.Ggia_1;

                if (!result) {
                    // Fallback: If it was already acknowledged but we didn't save the result,
                    // mark the acknowledgment unstractStatus as 'COMPLETED' to prevent further infinite polling/errors.
                    await this._acknowledgmentRepository.updateById(acknowledgementId, {
                        unstractStatus: 'COMPLETED'
                    });

                    return response.sendResponse({
                        status: 'COMPLETED',
                        message: 'Extraction completed and already acknowledged'
                    });
                }

                // Map pet info
                const petTypeMap = { 'Dog': petType.DOG, 'Cat': petType.CAT };
                const sexMap = { 'Male': petSex.MALE, 'Female': petSex.FEMALE };

                const extractedPetType = petTypeMap[result.pet_type] || 1;
                const sex = sexMap[result.sex] || 1;
                const age = (result.age && typeof result.age === 'string') ? (parseInt(result.age.replace(/\D/g, '')) || 0) : (parseInt(result.age) || 0);

                let existingOwner = null;
                const extractedEmail = result.email && typeof result.email === 'string' ? result.email.trim() : null;

                if (extractedEmail) {
                    existingOwner = await this._petOwnerRepository.findOne({
                        email: extractedEmail,
                        _id: { $ne: acknowledgment.owner }
                    });
                }

                if (existingOwner) {
                    // Update existing owner with extracted information
                    const existingOwnerUpdatePayload = {};
                    if (result.owner_name) existingOwnerUpdatePayload.name = result.owner_name;
                    if (result.phone_number) existingOwnerUpdatePayload.phone = result.phone_number;

                    if (Object.keys(existingOwnerUpdatePayload).length > 0) {
                        await this._petOwnerRepository.updateById(existingOwner._id, existingOwnerUpdatePayload);
                    }

                    // Re-associate Pet to the existing owner
                    await this._petRepository.updateById(acknowledgment.pet, {
                        name: result.pet_name,
                        type: extractedPetType,
                        sex: sex,
                        breed: result.breed ? (Array.isArray(result.breed) ? result.breed : [result.breed]) : [],
                        age: age,
                        address: result.address,
                        owner: existingOwner._id
                    });

                    // Update Acknowledgment status, metadata, and set owner to the existing owner
                    await this._acknowledgmentRepository.updateById(acknowledgementId, {
                        owner: existingOwner._id,
                        unstractStatus: 'COMPLETED',
                        fileExecutionId: message.file_execution_id,
                        sourceHash: message.metadata.source_hash
                    });

                    // Delete the temporary duplicate owner to avoid orphan records in the database
                    await this._petOwnerRepository.deleteById(acknowledgment.owner);
                } else {
                    // Update current PetOwner
                    const ownerUpdatePayload = {};
                    if (result.owner_name) ownerUpdatePayload.name = result.owner_name;
                    if (extractedEmail) ownerUpdatePayload.email = extractedEmail;
                    if (result.phone_number) ownerUpdatePayload.phone = result.phone_number;

                    if (Object.keys(ownerUpdatePayload).length > 0) {
                        await this._petOwnerRepository.updateById(acknowledgment.owner, ownerUpdatePayload);
                    }

                    // Update Pet
                    await this._petRepository.updateById(acknowledgment.pet, {
                        name: result.pet_name,
                        type: extractedPetType,
                        sex: sex,
                        breed: result.breed ? (Array.isArray(result.breed) ? result.breed : [result.breed]) : [],
                        age: age,
                        address: result.address
                    });

                    // Update Acknowledgment status and metadata
                    await this._acknowledgmentRepository.updateById(acknowledgementId, {
                        unstractStatus: 'COMPLETED',
                        fileExecutionId: message.file_execution_id,
                        sourceHash: message.metadata.source_hash
                    });
                }

                return response.sendResponse({
                    status: 'COMPLETED',
                    details: result
                });
            }

            return response.sendResponse({
                status: (pollData && pollData.status) || 'PENDING'
            });

        } catch (error) {
            return response.internalServerErrorResponse(error);
        }
    }

    searchGroomer = async (req, res) => {
        const response = new BaseResponse(req, res);
        try {
            const { phone } = req.query;
            if (!phone) {
                throw new BadRequestError('Phone number is required');
            }

            const groomer = await this._userRepository.findOne({ phone }, 'businessName businessAddress contactPerson phone phoneCode email _id');

            return response.sendResponse(groomer);
        } catch (error) {
            return response.internalServerErrorResponse(error);
        }
    }
}

module.exports = new AcknowledgmentController();
