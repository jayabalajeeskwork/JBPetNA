module.exports = {
   userType: {
      PET_GROOMER: 1,
      VETERINARIAN: 2,
      RETAIL: 3,
      RESTAURANT: 4,
      PROFESSIONAL_SERVICES: 5,
      OTHER: 6
   },
   acknowledgmentType: {
      OWNER_INFO: 1,
      PET_INFO: 2,
      LICENSE: 3,
      RABIES: 4,
      TAG: 5
   },
   acknowlegementStatus: {
      PENDING: 0,
      COMPLETED: 1
   },
   petType: {
      DOG: 1,
      CAT: 2
   },
   petSex: {
      MALE: 1,
      FEMALE: 2
   },
   licenseOption: {
      THROUGH_GGIA: 'through_ggia',
      MUNICIPALITY_SITE: 'municipality_site'
   }
};
