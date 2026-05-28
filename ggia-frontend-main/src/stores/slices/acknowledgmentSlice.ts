import { StateCreator } from "zustand";
import { apiRequest, endpoints } from "@/utils/endpoints";

export interface AcknowledgmentSlice {
  acknowledgments: any[];
  isListLoading: boolean;
  isDetailsLoading: boolean;
  isSubmittingLink: boolean;
  isSubmittingAcknowledgement: boolean;
  isUpdatingLicenseOption: boolean;
  isSubmittingLicenseDetails: boolean;
  isExtracting: boolean;
  acknowledgmentError: string | null;
  acknowledgmentMeta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  } | null;
  isAcknowledgementSheetOpen: boolean;
  linkVia: "Email" | "SMS";
  petType: "Dog" | "Cat";
  searchOwnerLoading: boolean;
  searchedOwner: any | null | undefined; // undefined = not searched, null = not found, any = found
  searchGroomerLoading: boolean;
  searchedGroomer: any | null | undefined;
  acknowledgmentDetails: any | null;
  getAcknowledgments: (
    pageNumber?: number,
    pageSize?: number,
  ) => Promise<{ success: boolean; error?: string }>;
  setAcknowledgmentDetails: (details: any) => void;
  setAcknowledgementSheetOpen: (open: boolean) => void;
  setLinkVia: (channel: "Email" | "SMS") => void;
  setPetType: (type: "Dog" | "Cat") => void;
  sendAcknowledgmentLink: (
    payload: any,
  ) => Promise<{ success: boolean; error?: string }>;
  searchOwner: (
    query: string,
    type: "email" | "phone",
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  clearSearchedOwner: () => void;
  searchGroomer: (
    phone: string,
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  clearSearchedGroomer: () => void;
  submitAcknowledgment: (
    payload: any,
  ) => Promise<{ success: boolean; error?: string }>;
  getAcknowledgmentDetails: (
    token: string,
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateLicenseOption: (payload: {
    acknowledgementId: string;
    licenseOption: "license_exists" | "through_ggia" | "municipality_site";
  }) => Promise<{ success: boolean; error?: string }>;
  submitLicenseDetails: (payload: { 
    acknowledgementId: string; 
    licenseOption?: string;
    color?: string;
    hairLength?: string;
    spayedNeutered?: boolean;
    vetName?: string;
    vetAddress?: string;
    vetPhone?: string;
    rabiesVaccinationReport?: string;
    licenseCertificate?: string;
    licenseConfirmation?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  extractVaccineData: (payload: {
    s3Url: string;
    acknowledgementId: string;
  }) => Promise<{ success: boolean; data?: any; error?: string }>;
  getExtractionStatus: (
    id: string,
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  fetchVeterinarians: (
    search: string,
  ) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  addToDashboard: (payload: {
    ownerId: string;
    userId: string;
    ownerName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const createAcknowledgmentSlice: StateCreator<AcknowledgmentSlice> = (
  set,
  get,
) => ({
  acknowledgments: [],
  isListLoading: false,
  isDetailsLoading: false,
  isSubmittingLink: false,
  isSubmittingAcknowledgement: false,
  isUpdatingLicenseOption: false,
  isSubmittingLicenseDetails: false,
  isExtracting: false,
  acknowledgmentError: null,
  acknowledgmentMeta: null,
  isAcknowledgementSheetOpen: false,
  linkVia: "SMS",
  petType: "Dog",
  searchOwnerLoading: false,
  searchedOwner: undefined,
  searchGroomerLoading: false,
  searchedGroomer: undefined,
  acknowledgmentDetails: null,

  setAcknowledgmentDetails: (details) =>
    set({ acknowledgmentDetails: details }),

  setAcknowledgementSheetOpen: (open) =>
    set({ isAcknowledgementSheetOpen: open }),

  clearSearchedOwner: () =>
    set({ searchedOwner: undefined, searchOwnerLoading: false }),

  clearSearchedGroomer: () =>
    set({ searchedGroomer: undefined, searchGroomerLoading: false }),

  setLinkVia: (channel) => set({ linkVia: channel }),
  setPetType: (type) => set({ petType: type }),

  getAcknowledgments: async (pageNumber = 1, pageSize = 20) => {
    set({ isListLoading: true, acknowledgmentError: null });
    try {
      const url = `${endpoints.getAcknowledgments.url}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      const { data, error } = await apiRequest(url, {
        method: endpoints.getAcknowledgments.method,
      });

      if (error) {
        set({
          isListLoading: false,
          acknowledgmentError:
            error.message || "Failed to fetch acknowledgments",
        });
        return { success: false, error: error.message };
      }

      if (data && data.data) {
        const responseData = data.data;
        set({
          acknowledgments: responseData.documents || [],
          acknowledgmentMeta: {
            totalItems: responseData.totalDocuments || 0,
            totalPages: responseData.totalPages || 1,
            currentPage: responseData.pageNumber || 1,
            pageSize: responseData.pageSize || 20,
          },
          isListLoading: false,
        });
        return { success: true };
      }

      set({ isListLoading: false, acknowledgmentError: "No data received" });
      return { success: false, error: "No data received" };
    } catch (err) {
      set({
        isListLoading: false,
        acknowledgmentError: "An unexpected error occurred",
      });
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  sendAcknowledgmentLink: async (payload) => {
    set({ isSubmittingLink: true });
    try {
      const { data, error } = await apiRequest(
        endpoints.sendAcknowledgmentLink.url,
        {
          method: endpoints.sendAcknowledgmentLink.method,
          body: JSON.stringify(payload),
        },
      );

      set({ isSubmittingLink: false });
      if (error) {
        const message =
          error.message ||
          (Array.isArray(error.messages)
            ? error.messages.join(", ")
            : error.messages) ||
          "Failed to send link";
        return { success: false, error: message };
      }
      return { success: true, data };
    } catch (err) {
      set({ isSubmittingLink: false });
      return { success: false, error: "Network error" };
    }
  },

  searchOwner: async (query: string, type: "email" | "phone") => {
    set({ searchOwnerLoading: true, searchedOwner: undefined });
    try {
      const params = new URLSearchParams();
      params.append(type, query);
      const url = `${endpoints.searchOwner.url}?${params.toString()}`;
      const { data, error } = await apiRequest(url, {
        method: endpoints.searchOwner.method,
      });

      set({ searchOwnerLoading: false });
      if (error) {
        set({ searchedOwner: null });
        return { success: false, error: error.message };
      }

      if (data && data.data) {
        set({ searchedOwner: data.data });
        return { success: true, data: data.data };
      }

      set({ searchedOwner: null });
      return { success: false, error: "Owner not found" };
    } catch (err) {
      set({ searchOwnerLoading: false, searchedOwner: null });
      return { success: false, error: "Network error" };
    }
  },

  searchGroomer: async (phone: string) => {
    set({ searchGroomerLoading: true, searchedGroomer: undefined });
    try {
      const url = `${endpoints.searchGroomer.url}?phone=${phone}`;
      const { data, error } = await apiRequest(url, {
        method: endpoints.searchGroomer.method,
      });

      set({ searchGroomerLoading: false });
      if (error) {
        set({ searchedGroomer: null });
        return { success: false, error: error.message };
      }

      if (data && data.data) {
        set({ searchedGroomer: data.data });
        return { success: true, data: data.data };
      }

      set({ searchedGroomer: null });
      return { success: false, error: "Groomer not found" };
    } catch (err) {
      set({ searchGroomerLoading: false, searchedGroomer: null });
      return { success: false, error: "Network error" };
    }
  },

  submitAcknowledgment: async (payload) => {
    set({ isSubmittingAcknowledgement: true });
    try {
      const { data, error } = await apiRequest(
        endpoints.submitAcknowledgment.url,
        {
          method: endpoints.submitAcknowledgment.method,
          body: JSON.stringify(payload),
        },
      );

      set({ isSubmittingAcknowledgement: false });
      if (!error) {
        return { success: true };
      }
      return {
        success: false,
        error: error.message || "Failed to submit acknowledgment",
      };
    } catch (err) {
      set({ isSubmittingAcknowledgement: false });
      return { success: false, error: "Network error" };
    }
  },

  getAcknowledgmentDetails: async (token: string) => {
    set({ isDetailsLoading: true, acknowledgmentError: null });
    try {
      const url = `${endpoints.getAcknowledgmentDetails.url}/${token}`;
      const { data, error } = await apiRequest(url, {
        method: endpoints.getAcknowledgmentDetails.method,
      });

      set({ isDetailsLoading: false });
      if (error) {
        set({
          acknowledgmentError: error.message || "Failed to fetch details",
        });
        return { success: false, error: error.message };
      }

      if (data && data.data) {
        set({ acknowledgmentDetails: data.data });
        return { success: true, data: data.data };
      }

      set({ acknowledgmentError: "Details not found" });
      return { success: false, error: "Details not found" };
    } catch (err) {
      set({ isDetailsLoading: false, acknowledgmentError: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  updateLicenseOption: async (payload) => {
    set({ isUpdatingLicenseOption: true });
    try {
      const { data, error } = await apiRequest(
        endpoints.updateLicenseOption.url,
        {
          method: endpoints.updateLicenseOption.method,
          body: JSON.stringify(payload),
        },
      );

      set({ isUpdatingLicenseOption: false });
      if (!error) {
        return { success: true };
      }
      return {
        success: false,
        error: error.message || "Failed to update license option",
      };
    } catch (err) {
      set({ isUpdatingLicenseOption: false });
      return { success: false, error: "Network error" };
    }
  },

  submitLicenseDetails: async (payload) => {
    set({ isSubmittingLicenseDetails: true });
    try {
      const { data, error } = await apiRequest(
        endpoints.submitLicenseDetails.url,
        {
          method: endpoints.submitLicenseDetails.method,
          body: JSON.stringify(payload),
        },
      );

      set({ isSubmittingLicenseDetails: false });
      if (!error) {
        return { success: true };
      }
      return {
        success: false,
        error: error.message || "Failed to submit license details",
      };
    } catch (err) {
      set({ isSubmittingLicenseDetails: false });
      return { success: false, error: "Network error" };
    }
  },

  extractVaccineData: async (payload) => {
    set({ isExtracting: true });
    try {
      const { data, error } = await apiRequest(
        endpoints.extractVaccineData.url,
        {
          method: endpoints.extractVaccineData.method,
          body: JSON.stringify(payload),
        },
      );

      if (error) {
        set({ isExtracting: false });
        return {
          success: false,
          error: error.message || "Failed to extract data",
        };
      }
      return { success: true, data: data.data };
    } catch (err) {
      set({ isExtracting: false });
      return { success: false, error: "Network error" };
    }
  },

  getExtractionStatus: async (id: string) => {
    try {
      const url = endpoints.getExtractionStatus.url.replace(":id", id);
      const { data, error } = await apiRequest(url, {
        method: endpoints.getExtractionStatus.method,
      });

      if (error) {
        set({ isExtracting: false });
        return {
          success: false,
          error: error.message || "Failed to get status",
        };
      }

      const status = data?.data?.status;
      if (status === "COMPLETED" || status === "FAILED") {
        set({ isExtracting: false });
        
        if (status === "COMPLETED" && data?.data?.details) {
          const extracted = data.data.details;
          const currentDetails = get().acknowledgmentDetails;
          
          const updatedDetails = {
            ...currentDetails,
            owner: {
              ...(currentDetails?.owner || {}),
              name: extracted.owner_name || currentDetails?.owner?.name,
              email: extracted.email || currentDetails?.owner?.email,
              phone: extracted.phone_number || currentDetails?.owner?.phone,
              address: extracted.address || currentDetails?.owner?.address,
            },
            pet: {
              ...(currentDetails?.pet || {}),
              name: extracted.pet_name || currentDetails?.pet?.name,
              breed: extracted.breed || currentDetails?.pet?.breed,
              age: extracted.age || currentDetails?.pet?.age,
              type: extracted.pet_type === "Cat" ? 2 : 1,
              sex: extracted.sex === "Female" ? 2 : 1,
              has_rabies_shot: extracted.has_rabies_shot,
            }
          };
          
          set({ acknowledgmentDetails: updatedDetails });
        }
      }

      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, error: "Network error" };
    }
  },
  fetchVeterinarians: async (search: string) => {
    try {
      const url = `${endpoints.getVeterinarians.url}?search=${encodeURIComponent(search)}`;
      const { data, error } = await apiRequest(url, {
        method: endpoints.getVeterinarians.method,
      });

      if (error) {
        return {
          success: false,
          error: error.message || "Failed to fetch veterinarians",
        };
      }

      return { success: true, data: data?.data?.documents || [] };
    } catch (err) {
      return { success: false, error: "Network error" };
    }
  },
  addToDashboard: async (payload) => {
    set({ isSubmittingAcknowledgement: true });
    try {
      const { data, error } = await apiRequest(
        endpoints.addToDashboard.url,
        {
          method: endpoints.addToDashboard.method,
          body: JSON.stringify(payload),
        },
      );

      set({ isSubmittingAcknowledgement: false });
      if (!error) {
        return { success: true };
      }
      return {
        success: false,
        error: error.message || "Failed to add to dashboard",
      };
    } catch (err) {
      set({ isSubmittingAcknowledgement: false });
      return { success: false, error: "Network error" };
    }
  },
});
