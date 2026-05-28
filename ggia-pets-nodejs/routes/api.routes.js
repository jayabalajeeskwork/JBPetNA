const express = require('express');
const router = express.Router();
const moment = require('moment');
const authMiddleware = require('../http/middlewares/api');
const MunicipalityController = require('../http/controllers/api/municipality.controller');
const AcknowledgmentController = require('../http/controllers/api/acknowledgment.controller');
const FileController = require('../http/controllers/file.controller');
const fileUpload = require('../config/fileUpload');
const CountyController = require('../http/controllers/api/county.controller');
const VeterinarianController = require('../http/controllers/api/veterinarian.controller');

// Project routes will be added here
router.post('/upload/files', fileUpload.files(FileController.expectedFiles()), FileController.uploadFiles);
// router.post('/municipalities/import', fileUpload.excelFile('file'), MunicipalityController.importMunicipalities);
router.post('/veterinarians/import', fileUpload.excelFile('file'), VeterinarianController.importVeterinarians);
router.get('/veterinarians', VeterinarianController.getVeterinarians);
router.post('/acknowledgments', AcknowledgmentController.submit);
router.post('/acknowledgments/license-details', AcknowledgmentController.submitLicenseDetails);
router.post('/acknowledgments/update-license-option', AcknowledgmentController.updateLicenseOption);
router.post('/acknowledgments/extract-vaccine-data', AcknowledgmentController.extractVaccineData);
router.get('/municipalities', MunicipalityController.getMunicipalities);
router.get('/counties', CountyController.getCounties);

router.get('/acknowledgments/search-owner', AcknowledgmentController.searchOwner);
router.get('/acknowledgments/search-groomer', AcknowledgmentController.searchGroomer);
router.get('/acknowledgments/details/:token', AcknowledgmentController.getDetailsByToken);
router.post('/acknowledgments/send-link', authMiddleware.optionalAuth, AcknowledgmentController.sendAcknowlegementLink);
router.get('/acknowledgments/:acknowledgementId/unstract-status', AcknowledgmentController.getUnstractStatus);
router.post('/acknowledgments/add-to-dashboard', authMiddleware.optionalAuth, AcknowledgmentController.addToDashboard);


router.use(authMiddleware.auth)
router.get('/acknowledgments', AcknowledgmentController.list);



module.exports = router;
