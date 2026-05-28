// API Configuration
export const baseUrl = "https://api-ggia.appening.xyz";
export const appUrl = baseUrl;
export const uploadUrl = `${baseUrl}/upload/`;
export const imageBaseUrl = `${baseUrl}/upload/`;
export const s3BaseUrl = "https://bl-public-storage.s3.us-east-1.amazonaws.com";

export const domain = "http://localhost:3000";
export const env = "development";

// Default headers for API requests
const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

// Custom fetch wrapper for API calls
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers = {
    ...defaultHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        console.warn("Unauthorized - clearing session");
        localStorage.removeItem("auth_token");
      }
      return { error: "Unauthorized", status: 401, ok: false };
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Return raw data as error so slices can manage it separately
      return { data: null, error: data, status: response.status, ok: false };
    }

    return { data, error: null, status: response.status, ok: true };
  } catch (error) {
    console.error("API Request Error:", error);
    return {
      data: null,
      error: "Network error or server unreachable",
      status: 500,
      ok: false
    };
  }
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

// Endpoints configuration
export const endpoints = {
  baseUrl,
  imageBaseUrl,

  // Auth
  login: {
    url: "/auth/login",
    method: HTTP_METHODS.POST,
  },
  signup: {
    url: "/auth/signup",
    method: HTTP_METHODS.POST,
  },
  verifyOtp: {
    url: "/auth/verify-otp",
    method: HTTP_METHODS.POST,
  },
  resendOtp: {
    url: "/auth/resend-otp",
    method: HTTP_METHODS.POST,
  },
  logout: {
    url: "/auth/logout",
    method: HTTP_METHODS.POST,
  },
  getMunicipalities: {
    url: "/api/municipalities",
    method: HTTP_METHODS.GET,
  },
  getAcknowledgments: {
    url: "/api/acknowledgments",
    method: HTTP_METHODS.GET,
  },
  sendAcknowledgmentLink: {
    url: "/api/acknowledgments/send-link",
    method: HTTP_METHODS.POST,
  },
  searchOwner: {
    url: "/api/acknowledgments/search-owner",
    method: HTTP_METHODS.GET,
  },
  searchGroomer: {
    url: "/api/acknowledgments/search-groomer",
    method: HTTP_METHODS.GET,
  },
  getCounties: {
    url: "/api/counties",
    method: HTTP_METHODS.GET,
  },
  submitAcknowledgment: {
    url: "/api/acknowledgments",
    method: HTTP_METHODS.POST,
  },
  uploadFile: {
    url: "/api/upload/files",
    method: HTTP_METHODS.POST,
  },
  getAcknowledgmentDetails: {
    url: "/api/acknowledgments/details",
    method: HTTP_METHODS.GET,
  },
  extractVaccineData: {
    url: "/api/acknowledgments/extract-vaccine-data",
    method: HTTP_METHODS.POST,
  },
  updateLicenseOption: {
    url: "/api/acknowledgments/update-license-option",
    method: HTTP_METHODS.POST,
  },
  submitLicenseDetails: {
    url: "/api/acknowledgments/license-details",
    method: HTTP_METHODS.POST,
  },
  getExtractionStatus: {
    url: "/api/acknowledgments/:id/unstract-status",
    method: HTTP_METHODS.GET,
  },
  getVeterinarians: {
    url: "/api/veterinarians",
    method: HTTP_METHODS.GET,
  },
  addToDashboard: {
    url: "/api/acknowledgments/add-to-dashboard",
    method: HTTP_METHODS.POST,
  },
};
