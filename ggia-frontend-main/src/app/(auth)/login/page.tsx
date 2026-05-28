"use client";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  Timer,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/stores/useStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const { login, verifyOtp, authLoading, authError, clearAuthError } =
    useStore();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      router.replace("/dashboard");
    } else {
      setIsRedirecting(false);
    }
  }, [router]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showIdentifierError, setShowIdentifierError] = useState(false);
  const [identifierErrorMessage, setIdentifierErrorMessage] = useState("");
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showOtpError, setShowOtpError] = useState(false);
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPasswordPassword, setShowPasswordPassword] = useState(false);
  const [isSendingOtpState, setIsSendingOtpState] = useState(false);

  // Handle countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const isPhoneMode = useMemo(() => {
    const trimmed = identifier.trim();
    if (trimmed.includes("@")) return false;
    return trimmed.length > 0 && /^\d|\(/.test(trimmed);
  }, [identifier]);

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const trimmed = val.trim();

    let isPhone = false;
    if (val.includes("@")) {
      setIdentifier(val);
    } else if (/^\d|\(/.test(trimmed)) {
      setIdentifier(formatPhoneNumber(val));
      isPhone = true;
    } else {
      setIdentifier(val);
    }

    // Real-time validation for all modes
    if (trimmed.length === 0) {
      setShowIdentifierError(false);
    } else if (val.includes("@")) {
      if (!EMAIL_REGEX.test(trimmed)) {
        setIdentifierErrorMessage("Please enter a valid email address");
        setShowIdentifierError(true);
      } else {
        setShowIdentifierError(false);
      }
    } else if (isPhone) {
      // Remove real-time phone validation as it's annoying while typing
      setShowIdentifierError(false);
    } else {
      // It's random text (not starting with digit and no @)
      setIdentifierErrorMessage("Please enter a valid email");
      setShowIdentifierError(true);
    }
  };

  const validateIdentifier = () => {
    const trimmed = identifier.trim();
    if (trimmed.length === 0) {
      setIdentifierErrorMessage("Email/Phone no. is required");
      return false;
    }

    if (isPhoneMode) {
      const digits = trimmed.replace(/\D/g, "");
      if (digits.length !== 10) {
        setIdentifierErrorMessage("Please enter a valid 10-digit phone number");
        return false;
      }
    } else {
      if (!EMAIL_REGEX.test(trimmed)) {
        setIdentifierErrorMessage("Please enter a valid email address");
        return false;
      }
    }

    return true;
  };

  const handleGetOtp = async () => {
    const isValid = validateIdentifier();
    setShowIdentifierError(!isValid);
    clearAuthError();

    if (isValid) {
      const trimmedIdentifier = identifier.trim();
      let payload: any = {};

      if (isPhoneMode) {
        payload.phoneCode = "+1";
        payload.phone = trimmedIdentifier.replace(/\D/g, "");
      } else {
        payload.email = trimmedIdentifier;
      }

      setIsSendingOtpState(true);
      const { success, error } = await login(payload);
      setIsSendingOtpState(false);

      if (success) {
        setIsOtpSent(true);
        setCountdown(30);
      } else {
        toast.error(error || "Failed to send OTP");
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearAuthError();

    if (loginMode === "otp" && !isOtpSent) {
      handleGetOtp();
      return;
    }

    const isIdentifierValid = validateIdentifier();
    setShowIdentifierError(!isIdentifierValid);

    let isCredentialValid = false;
    if (loginMode === "password") {
      isCredentialValid = password.trim().length > 0;
      setShowPasswordError(!isCredentialValid);
    } else {
      isCredentialValid = otp.trim().length > 0;
      setShowOtpError(!isCredentialValid);
    }

    if (isIdentifierValid && isCredentialValid) {
      const trimmedIdentifier = identifier.trim();
      let payload: any = loginMode === "password" ? { password } : { otp };

      if (isPhoneMode) {
        payload.phoneCode = "+1";
        payload.phone = trimmedIdentifier.replace(/\D/g, "");
      } else {
        payload.email = trimmedIdentifier;
      }

      if (loginMode === "otp") {
        payload.isRegister = false;
        const { success, error } = await verifyOtp(payload);
        if (success) {
          router.push("/dashboard");
        } else {
          toast.error(error || "OTP verification failed");
        }
      } else {
        const { success, error } = await login(payload);
        if (success) {
          router.push("/dashboard");
        } else {
          toast.error(error || "Login failed");
        }
      }
    }
  };

  const toggleLoginMode = async () => {
    if (loginMode === "password") {
      const isValid = validateIdentifier();
      setShowIdentifierError(!isValid);
      clearAuthError();

      if (!isValid) return;

      const trimmedIdentifier = identifier.trim();
      let payload: any = {};

      if (isPhoneMode) {
        payload.phoneCode = "+1";
        payload.phone = trimmedIdentifier.replace(/\D/g, "");
      } else {
        payload.email = trimmedIdentifier;
      }

      setIsSendingOtpState(true);
      const { success, error } = await login(payload);
      setIsSendingOtpState(false);

      if (success) {
        setLoginMode("otp");
        setIsOtpSent(true);
        setCountdown(30);
        setShowPasswordError(false);
        setShowOtpError(false);
        setShowPasswordPassword(false);
      } else {
        toast.error(error || "Failed to send OTP");
      }
    } else {
      setLoginMode("password");
      setShowPasswordError(false);
      setShowOtpError(false);
      setIsOtpSent(false);
      setCountdown(0);
      clearAuthError();
      setShowPasswordPassword(false);
    }
  };

  if (isRedirecting) return null;

  return (
    <div className="w-full max-w-[640px] text-center">
      <h1 className="text-[34px] font-semibold leading-tight text-[#111827] sm:text-[42px]">
        Log in to Ggia
      </h1>
      <p className="mt-2 text-sm text-[#6B7280] sm:text-[15px]">
        Access your groomer/daycare portal
      </p>

      <div className="mx-auto mt-8 w-full max-w-[560px] rounded-[18px] bg-white p-5 pt-2 shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] sm:p-7 sm:pt-3">
        {/* <div className="text-left">
          <h2 className="text-[28px] font-semibold leading-tight text-[#111827]">
            Log in to Ggia
          </h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Access your groomer/daycare portal
          </p>
        </div> */}

        <form className="mt-6 text-left" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="identifier"
              className="mb-2 block text-[14px] font-medium text-[#111827]"
            >
              Phone Number or Email <span className="text-[#DC2626]">*</span>
            </label>
            <div className="flex gap-2">
              {isPhoneMode && (
                <div className="flex h-12 w-[60px] shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[14px] font-medium text-[#111827]">
                  +1
                </div>
              )}
              <Input
                id="identifier"
                type="text"
                placeholder="Your email or mobile number"
                value={identifier}
                onChange={handleIdentifierChange}
                aria-invalid={showIdentifierError}
                aria-describedby={
                  showIdentifierError ? "identifier-error" : undefined
                }
                className={cn(
                  "h-12 flex-1 rounded-[10px] text-[14px] placeholder:text-[#9CA3AF] focus-visible:ring-1",
                  showIdentifierError ? "border-[#DC2626]" : "border-[#E5E7EB]",
                )}
              />
            </div>
            {showIdentifierError ? (
              <p
                id="identifier-error"
                className="mt-2 text-[12px] text-[#DC2626]"
                role="alert"
              >
                {identifierErrorMessage}
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <label
              htmlFor={loginMode === "password" ? "password" : "otp"}
              className="mb-2 block text-[14px] font-medium text-[#111827]"
            >
              {loginMode === "password" ? "Password" : "OTP"}{" "}
              <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <Input
                key={loginMode}
                id={loginMode === "password" ? "password" : "otp"}
                type={
                  loginMode === "password"
                    ? showPasswordPassword
                      ? "text"
                      : "password"
                    : "text"
                }
                placeholder={loginMode === "password" ? "Password" : "OTP"}
                value={loginMode === "password" ? password : otp}
                onChange={(event) => {
                  const val = event.target.value;
                  if (loginMode === "password") {
                    setPassword(val);
                    if (showPasswordError && val.trim().length > 0)
                      setShowPasswordError(false);
                  } else {
                    setOtp(val.replace(/\D/g, "").slice(0, 6));
                    if (showOtpError && val.trim().length > 0)
                      setShowOtpError(false);
                  }
                }}
                aria-invalid={
                  loginMode === "password" ? showPasswordError : showOtpError
                }
                aria-describedby={
                  (loginMode === "password" && showPasswordError) ||
                  (loginMode === "otp" && showOtpError)
                    ? "credential-error"
                    : undefined
                }
                className={`h-12 rounded-[10px] text-[14px] placeholder:text-[#9CA3AF] focus-visible:ring-1 ${
                  (loginMode === "password" && showPasswordError) ||
                  (loginMode === "otp" && showOtpError)
                    ? "border-[#DC2626]"
                    : "border-[#E5E7EB]"
                } ${loginMode === "password" ? "pr-11" : ""}`}
              />
              {loginMode === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPasswordPassword(!showPasswordPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#03838C] transition-colors cursor-pointer"
                >
                  {showPasswordPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            {(loginMode === "password" && showPasswordError) ||
            (loginMode === "otp" && showOtpError) ? (
              <p
                id="credential-error"
                className="mt-2 text-[12px] text-[#DC2626]"
                role="alert"
              >
                {loginMode === "password" ? "Password" : "OTP"} is required
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] text-[#6B7F7C]">
              <input type="checkbox" className="peer sr-only" />
              <span className="flex h-[20px] w-[20px] items-center justify-center rounded-[6px] border border-[#D1D5DB] bg-white transition-colors peer-checked:border-[#03838C] peer-checked:bg-[#03838C] [&_svg]:opacity-0 [&_svg]:transition-opacity peer-checked:[&_svg]:opacity-100">
                <Check className="h-5 w-5 text-white" strokeWidth={1.8} />
              </span>
              Remember Me
            </label>
            {loginMode === "password" ? (
              <Link
                href="/login/forgot-password"
                className="cursor-pointer text-[14px] font-medium text-[#03838C] hover:underline"
              >
                Forget Password?
              </Link>
            ) : (
              <button
                type="button"
                disabled={countdown > 0}
                onClick={handleGetOtp}
                className={`flex items-center gap-1 text-[14px] font-medium transition-colors ${
                  countdown > 0
                    ? "cursor-not-allowed text-[#9CA3AF]"
                    : "cursor-pointer text-[#6B7280] hover:text-[#03838C]"
                }`}
              >
                <Timer className="h-4 w-4" />
                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
              </button>
            )}
          </div>

          <Button
            type="submit"
            disabled={authLoading || isSendingOtpState}
            className="mt-5 h-12 w-full cursor-pointer rounded-[10px] bg-[#03838C] text-[16px] font-semibold text-white hover:bg-[#036D75] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSendingOtpState
              ? "Sending OTP..."
              : authLoading
                ? "Logging in..."
                : loginMode === "password"
                  ? "Login"
                  : isOtpSent
                    ? "Login"
                    : "Get OTP"}
            {!(authLoading || isSendingOtpState) && <ArrowRight className="h-4 w-4" />}
          </Button>

          <div className="my-4 flex items-center gap-3 text-[#9CA3AF]">
            <div className="h-px flex-1 bg-[#E5E7EB]" />
            <span className="text-xs">or</span>
            <div className="h-px flex-1 bg-[#E5E7EB]" />
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={authLoading || isSendingOtpState}
            onClick={toggleLoginMode}
            className="h-12 w-full cursor-pointer rounded-[10px] border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#111827] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMode === "password"
              ? "Use OTP instead"
              : "Use Password instead"}
            {loginMode === "password" ? (
              <Smartphone className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
