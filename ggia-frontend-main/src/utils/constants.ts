export const DOMAIN_URL = "https://appening.com";

export const BUSINESS_TYPE_OPTIONS = [
  { value: 1, label: "Pet Groomer" },
  { value: 2, label: "Veterinarian" },
  { value: 3, label: "Retail" },
  { value: 4, label: "Restaurant" },
  { value: 5, label: "Professional Services" },
  { value: 6, label: "Other" },
] as const;

export const ACKNOWLEDGEMENT_STATUS_OPTIONS = [
  { value: 0, label: "Pending" },
  { value: 1, label: "Approved" },
  { value: 2, label: "Rejected" },
] as const;

export const DOG_BREEDS = [
  "Golden Retriever",
  "German Shepherd",
  "Labrador Retriever",
  "French Bulldog",
  "Beagle",
  "Poodle",
  "Rottweiler",
  "Bulldog",
  "Boxer",
  "Dachshund",
  "Yorkshire Terrier",
  "Siberian Husky",
  "Great Dane",
  "Doberman Pinscher",
  "Australian Shepherd",
];

export const CAT_BREEDS = [
  "Persian",
  "Maine Coon",
  "Siamese",
  "Ragdoll",
  "Sphynx",
  "Bengal",
  "Abyssinian",
  "Scottish Fold",
  "Burmese",
  "Birman",
  "Russian Blue",
  "British Shorthair",
  "Oriental Shorthair",
  "Devon Rex",
  "Norwegian Forest Cat",
];
export const PET_TYPE = {
  DOG: 1,
  CAT: 2,
} as const;
