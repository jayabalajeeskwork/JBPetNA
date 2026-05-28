import { StateCreator } from "zustand";
import { apiRequest, endpoints } from "@/utils/endpoints";

export interface Municipality {
  _id: string;
  name: string;
  [key: string]: any;
}

export interface County {
  _id: string;
  name: string;
  [key: string]: any;
}

export interface CommonSlice {
  municipalities: Municipality[];
  counties: County[];
  isCommonLoading: boolean;
  fetchMunicipalities: (limit?: number) => Promise<void>;
  fetchCounties: () => Promise<void>;
  uploadFile: (
    file: File,
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
}

export const createCommonSlice: StateCreator<CommonSlice> = (set) => ({
  municipalities: [],
  counties: [],
  isCommonLoading: false,

  fetchMunicipalities: async (limit = 500) => {
    set({ isCommonLoading: true });
    try {
      const url = `${endpoints.getMunicipalities.url}?limit=${limit}`;
      const { data, error } = await apiRequest(url, {
        method: endpoints.getMunicipalities.method,
      });

      if (!error && data) {
        // Handle paginated or direct array responses
        let list: Municipality[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data.data) {
          list = Array.isArray(data.data)
            ? data.data
            : data.data.documents || data.data.list || [];
        }

        set({
          municipalities: Array.isArray(list) ? list : [],
          isCommonLoading: false,
        });
      } else {
        set({ isCommonLoading: false });
      }
    } catch (err) {
      set({ isCommonLoading: false });
    }
  },

  fetchCounties: async () => {
    set({ isCommonLoading: true });
    try {
      const { data, error } = await apiRequest(endpoints.getCounties.url, {
        method: endpoints.getCounties.method,
      });

      if (!error && data) {
        let list: County[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data.data) {
          list = Array.isArray(data.data)
            ? data.data
            : data.data.documents || data.data.list || [];
        }

        set({
          counties: Array.isArray(list) ? list : [],
          isCommonLoading: false,
        });
      } else {
        set({ isCommonLoading: false });
      }
    } catch (err) {
      set({ isCommonLoading: false });
    }
  },

  uploadFile: async (file: File) => {
    set({ isCommonLoading: true });
    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch(
        `${endpoints.baseUrl}${endpoints.uploadFile.url}`,
        {
          method: endpoints.uploadFile.method,
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      const result = await response.json();
      set({ isCommonLoading: false });

      if (response.ok && result.data) {
        // Handle array of objects with url property
        if (Array.isArray(result.data) && result.data.length > 0) {
          return { success: true, url: result.data[0].url };
        }
        // Handle data.files array of filenames
        if (
          result.data.files &&
          Array.isArray(result.data.files) &&
          result.data.files.length > 0
        ) {
          return {
            success: true,
            url: `${endpoints.imageBaseUrl}${result.data.files[0]}`,
          };
        }
      }
      return { success: false, error: result.message || "Upload failed" };
    } catch (err) {
      set({ isCommonLoading: false });
      return { success: false, error: "Network error during upload" };
    }
  },
});
