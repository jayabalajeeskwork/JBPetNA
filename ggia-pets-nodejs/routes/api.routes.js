
const express = require('express');
const router = express.Router();

const moment = require('moment');

const authMiddleware =
require('../http/middlewares/api');

const roleMiddleware =
require('../http/middlewares/role.middleware');

const { roles } =
require('../helpers/constants');

/* Controllers */

const MunicipalityController =
require('../http/controllers/api/municipality.controller');

const AcknowledgmentController =
require('../http/controllers/api/acknowledgment.controller');

const FileController =
require('../http/controllers/file.controller');

const CountyController =
require('../http/controllers/api/county.controller');

const VeterinarianController =
require('../http/controllers/api/veterinarian.controller');

const UserAuthController =
require('../http/controllers/api/auth.controller');

/* File Upload */

const fileUpload =
require('../config/fileUpload');

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

// FILES
router.post(
   '/upload/files',
   fileUpload.files(
      FileController.expectedFiles()
   ),
   FileController.uploadFiles
);

// VETERINARIANS
router.post(
   '/veterinarians/import',
   fileUpload.excelFile('file'),
   VeterinarianController.importVeterinarians
);

router.get(
   '/veterinarians',
   VeterinarianController.getVeterinarians
);

// ACKNOWLEDGMENTS
router.post(
   '/acknowledgments',
   AcknowledgmentController.submit
);

router.post(
   '/acknowledgments/license-details',
   AcknowledgmentController.submitLicenseDetails
);

router.post(
   '/acknowledgments/update-license-option',
   AcknowledgmentController.updateLicenseOption
);

router.post(
   '/acknowledgments/extract-vaccine-data',
   AcknowledgmentController.extractVaccineData
);

// MUNICIPALITIES
router.get(
   '/municipalities',
   MunicipalityController.getMunicipalities
);

// COUNTIES
router.get(
   '/counties',
   CountyController.getCounties
);

// SEARCH
router.get(
   '/acknowledgments/search-owner',
   AcknowledgmentController.searchOwner
);

router.get(
   '/acknowledgments/search-groomer',
   AcknowledgmentController.searchGroomer
);

// DETAILS
router.get(
   '/acknowledgments/details/:token',
   AcknowledgmentController.getDetailsByToken
);

// OPTIONAL AUTH
router.post(
   '/acknowledgments/send-link',
   authMiddleware.optionalAuth,
   AcknowledgmentController.sendAcknowlegementLink
);

router.get(
   '/acknowledgments/:acknowledgementId/unstract-status',
   AcknowledgmentController.getUnstractStatus
);

router.post(
   '/acknowledgments/add-to-dashboard',
   authMiddleware.optionalAuth,
   AcknowledgmentController.addToDashboard
);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

router.use(authMiddleware.auth);

/*
|--------------------------------------------------------------------------
| SUPER ADMIN ROUTES
|--------------------------------------------------------------------------
*/

// VIEW ALL ACKNOWLEDGMENTS
router.get(
   '/super-admin/acknowledgments',
   roleMiddleware(roles.SUPER_ADMIN),
   AcknowledgmentController.getAllAcknowledgments
);

// EXPORT CSV
router.get(
   '/super-admin/export-acknowledgments',
   roleMiddleware(roles.SUPER_ADMIN),
   AcknowledgmentController.exportAcknowledgments
);

// DISABLE CITY ADMIN
router.post(
   '/super-admin/disable-city-admin',
   roleMiddleware(roles.SUPER_ADMIN),
   UserAuthController.disableCityAdmin
);

// NORMAL ACKNOWLEDGMENT LIST
router.get(
   '/acknowledgments',
   AcknowledgmentController.list
);

module.exports = router;

