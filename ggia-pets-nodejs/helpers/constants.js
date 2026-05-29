module.exports = {
   roles: {
      SUPER_ADMIN: 1,
      MUNICIPALITY_ADMIN: 2,
      SERVICE_PROVIDER: 3,
      PET_OWNER: 4,
      CITY_ADMIN: 5
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
   }
};