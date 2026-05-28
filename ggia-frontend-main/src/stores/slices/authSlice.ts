import { StateCreator } from "zustand";
import { apiRequest, endpoints, baseUrl } from "@/utils/endpoints";
import { toast } from "sonner";

const isDev = baseUrl.includes("api-ggia.appening.xyz");

export interface AuthSlice {
  isAuthenticated: boolean;
  authLoading: boolean;
  signupLoading: boolean;
  verifyOtpLoading: boolean;
  resendOtpLoading: boolean;
  user: any | null;
  authError: string | null;
  registrationData: {
    phoneCode: string;
    phone: string;
  } | null;
  login: (payload: any) => Promise<{ success: boolean; error?: string }>;
  signup: (
    payload: any,
  ) => Promise<{ success: boolean; error?: string; data?: any }>;
  verifyOtp: (payload: any) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (payload: {
    phoneCode: string;
    phone: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setRegistrationData: (data: { phoneCode: string; phone: string }) => void;
  setAuthenticated: (status: boolean) => void;
  clearAuthError: () => void;
}

/**
 * Helper to parse error messages specific to Auth API responses.
 */
const getAuthErrorMessage = (error: any): string => {
  if (!error) return "Something went wrong";
  if (typeof error === "string") return error;

  if (error.messages) {
    return Array.isArray(error.messages)
      ? error.messages.join(", ")
      : error.messages;
  }

  if (error.message) return error.message;
  if (error.data?.message) return error.data.message;

  return "An unexpected error occurred";
};

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  isAuthenticated: false,
  authLoading: false,
  signupLoading: false,
  verifyOtpLoading: false,
  resendOtpLoading: false,
  user: null,
  authError: null,
  registrationData: null,

  setRegistrationData: (data) => set({ registrationData: data }),
  setAuthenticated: (status) => set({ isAuthenticated: status }),
  clearAuthError: () => set({ authError: null }),

  signup: async (payload: any) => {
    set({ signupLoading: true, authError: null });
    try {
      const { data, error } = await apiRequest(endpoints.signup.url, {
        method: endpoints.signup.method,
        body: JSON.stringify(payload),
      });

      set({ signupLoading: false });
      if (error) {
        const message = getAuthErrorMessage(error);
        set({ authError: message });
        return { success: false, error: message };
      }

      // Show OTP in toast if in dev environment
      const otp = data?.otp || data?.data?.otp;
      if (otp && isDev) {
        toast.success(`Your Verification Code is: ${otp}`);
      }

      return { success: true, data };
    } catch (err) {
      set({ signupLoading: false, authError: "Signup failed" });
      return { success: false, error: "Signup failed" };
    }
  },

  resendOtp: async (payload: { phoneCode: string; phone: string }) => {
    set({ resendOtpLoading: true, authError: null });
    try {
      const { data, error } = await apiRequest(endpoints.resendOtp.url, {
        method: endpoints.resendOtp.method,
        body: JSON.stringify(payload),
      });

      set({ resendOtpLoading: false });
      if (error) {
        const message = getAuthErrorMessage(error);
        set({ authError: message });
        return { success: false, error: message };
      }

      // Show OTP in toast if in dev environment
      const otp = data?.otp || data?.data?.otp;
      if (otp && isDev) {
        toast.success(`Your Verification Code is: ${otp}`);
      }

      return { success: true, data };
    } catch (err) {
      set({ resendOtpLoading: false, authError: "Failed to resend OTP" });
      return { success: false, error: "Failed to resend OTP" };
    }
  },

  verifyOtp: async (payload: any) => {
    set({ verifyOtpLoading: true, authError: null });
    try {
      const { data, error } = await apiRequest(endpoints.verifyOtp.url, {
        method: endpoints.verifyOtp.method,
        body: JSON.stringify({ isRegister: true, ...payload }),
      });

      set({ verifyOtpLoading: false });
      if (error) {
        const message = getAuthErrorMessage(error);
        set({ authError: message });
        return { success: false, error: message };
      }

      if (data) {
        const actualData = data.data || data;
        const token = actualData.token;
        const user = actualData.user;

        if (token) {
          localStorage.setItem("auth_token", token);
          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
          }
          set({ isAuthenticated: true, user: user });
        } else if (user) {
          // Store user even if no token yet (e.g. during registration)
          localStorage.setItem("user", JSON.stringify(user));
          set({ user: user });
        }
        
        return { success: true, data: actualData };
      }
      return { success: false, error: "Verification failed" };
    } catch (err) {
      set({ verifyOtpLoading: false, authError: "Verification failed" });
      return { success: false, error: "Verification failed" };
    }
  },

  login: async (payload: any) => {
    set({ authLoading: true, authError: null });
    try {
      const { data, error } = await apiRequest(endpoints.login.url, {
        method: endpoints.login.method,
        body: JSON.stringify(payload),
      });

      if (error) {
        const message = getAuthErrorMessage(error);
        set({ authLoading: false, authError: message });
        return { success: false, error: message };
      }

      if (data) {
        const actualData = data.data || data;
        const token = actualData.token || data.token;
        const user = actualData.user || data.user;

        // Show OTP in toast if in dev environment (for OTP-based login)
        const otp = actualData.otp || data?.otp || data?.data?.otp;
        if (otp && isDev) {
          toast.success(`Your Verification Code is: ${otp}`);
        }

        if (token) {
          localStorage.setItem("auth_token", token);
          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
          }
          set({ isAuthenticated: true, user: user, authLoading: false });
          return { success: true };
        }

        set({ authLoading: false });
        return { success: true, data };
      }

      set({ authLoading: false, authError: "No token received" });
      return { success: false, error: "Authentication failed" };
    } catch (err) {
      const message = "A network error occurred";
      set({ authLoading: false, authError: message });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    set({ authLoading: true });
    try {
      await apiRequest(endpoints.logout.url, {
        method: endpoints.logout.method,
      });
    } catch (err) {
      console.error("Logout API failed", err);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      set({
        isAuthenticated: false,
        user: null,
        authLoading: false,
        authError: null,
        registrationData: null,
      });
    }
  },
});
