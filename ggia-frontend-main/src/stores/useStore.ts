import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createUserSlice, UserSlice } from "./slices/userSlice";
import { createAuthSlice, AuthSlice } from "./slices/authSlice";
import { createCommonSlice, CommonSlice } from "./slices/commonSlice";
import {
  createAcknowledgmentSlice,
  AcknowledgmentSlice,
} from "./slices/acknowledgmentSlice";

// Combine all slice interfaces here
export type AppState = UserSlice &
  AuthSlice &
  CommonSlice &
  AcknowledgmentSlice & {
    logoutAll: () => void;
  };

// Create the combined store
export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get, ...a) => ({
        ...createUserSlice(set, get, ...a),
        ...createAuthSlice(set, get, ...a),
        ...createCommonSlice(set, get, ...a),
        ...createAcknowledgmentSlice(set, get, ...a),
        logoutAll: () => {
          localStorage.removeItem("auth_token");
          get().clearUser();
          get().setAuthenticated(false);
          get().clearAuthError();
        },
      }),
      {
        name: "ggia-auth-storage",
        partialize: (state) => {
          // Exclude large data and loading states from localStorage
          const {
            municipalities,
            counties,
            isCommonLoading,
            searchOwnerLoading,
            searchGroomerLoading,
            isListLoading,
            isDetailsLoading,
            isSubmittingLink,
            isSubmittingAcknowledgement,
            isUpdatingLicenseOption,
            isSubmittingLicenseDetails,
            isExtracting,
            ...rest
          } = state;
          return rest;
        },
      },
    ),
    {
      name: "GGIAStore",
    },
  ),
);
