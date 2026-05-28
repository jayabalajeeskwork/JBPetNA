"use client";

import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useStore } from "@/stores/useStore";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      router.replace("/dashboard");
    } else {
      setIsRedirecting(false);
    }
  }, [router]);

  const { signup, authLoading, setRegistrationData, registrationData } = useStore();

  const [phone, setPhone] = useState("");

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  useEffect(() => {
    if (registrationData?.phone) {
      setPhone(formatPhoneNumber(registrationData.phone));
    }
  }, [registrationData]);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = useState("");
  const [showTermsError, setShowTermsError] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedPhone = phone.trim();
    const digits = trimmedPhone.replace(/\D/g, "");
    const phoneOk = digits.length === 10;
    const termsOk = acceptedTerms;

    if (!phoneOk) {
      setPhoneErrorMessage(digits.length === 0 ? "Phone number is required" : "Please enter a valid 10-digit phone number");
      setShowPhoneError(true);
    } else {
      setShowPhoneError(false);
    }

    setShowTermsError(!termsOk);

    if (phoneOk && termsOk) {
      const finalPhone = digits;
      const finalPhoneCode = "+1";

      const { success, error } = await signup({ phoneCode: finalPhoneCode, phone: finalPhone });
      if (success) {
        setRegistrationData({ phoneCode: finalPhoneCode, phone: finalPhone });
        router.push("/register/otp-verification");
      } else {
        toast.error(error || "Failed to send OTP. Please try again.");
      }
    }
  };

  if (isRedirecting) return null;

  return (
    <div className="w-full max-w-[640px] text-center">
      <h1 className="text-[34px] font-semibold leading-tight text-[#111827] sm:text-[42px]">
        Create your Ggia business account
      </h1>
      <p className="mt-2 text-sm text-[#6B7280] sm:text-[15px]">
        Start sending acknowledgement links right away in under 2 minutes.
      </p>

      <div className="mx-auto mt-8 w-full max-w-[560px] rounded-[18px] bg-white p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] sm:p-10">
        <div className="text-left">
          <h2 className="text-[22px] font-semibold leading-tight text-[#111827] sm:text-[24px]">Let&apos;s get started</h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">Enter your mobile number for verification.</p>
        </div>

        <form className="mt-6 text-left" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="phone" className="mb-2 block text-[14px] font-medium text-[#111827]">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(event) => {
                const val = event.target.value;
                setPhone(formatPhoneNumber(val));
                if (showPhoneError && val.trim().length > 0) {
                  setShowPhoneError(false);
                }
              }}
              aria-invalid={showPhoneError}
              aria-describedby={showPhoneError ? "phone-error" : undefined}
              className={`h-12 rounded-[10px] text-[14px] placeholder:text-[#9CA3AF] focus-visible:ring-1 ${
                showPhoneError ? "border-[#DC2626]" : "border-[#E5E7EB]"
              }`}
            />
            {showPhoneError ? (
              <p id="phone-error" className="mt-2 text-[12px] text-[#DC2626]" role="alert">
                {phoneErrorMessage}
              </p>
            ) : null}
          </div>

          <div className="mt-5">
            <label className="flex cursor-pointer gap-3 text-left text-[13px] leading-snug text-[#6B7280] sm:text-[14px]">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => {
                  setAcceptedTerms(event.target.checked);
                  if (showTermsError && event.target.checked) {
                    setShowTermsError(false);
                  }
                }}
                className="peer sr-only"
              />
              <span className="mt-0.5 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] border border-[#D1D5DB] bg-white transition-colors peer-checked:border-[#03838C] peer-checked:bg-[#03838C] [&_svg]:opacity-0 [&_svg]:transition-opacity peer-checked:[&_svg]:opacity-100">
                <Check className="h-4 w-4 text-white" strokeWidth={2} />
              </span>
              <span>
                By continuing, you acknowledge that you accept {" "}
                <a href="#" className="font-medium text-[#03838C] underline underline-offset-2 hover:text-[#036D75]">
                our Terms of Use
                </a> {" "}
                and have read the {" "}
                <a href="#" className="font-medium text-[#03838C] underline underline-offset-2 hover:text-[#036D75]">
                  Privacy Policy
                </a>
                . You further agree to receive transactional message regarding your application.
              </span>
            </label>
            {showTermsError ? (
              <p className="mt-2 text-[12px] text-[#DC2626]" role="alert">
                Please accept the terms to continue
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={authLoading}
            className="mt-6 h-12 w-full rounded-[10px] bg-[#03838C] text-[16px] font-semibold text-white hover:bg-[#036D75] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {authLoading ? "Sending OTP..." : "Get OTP"}
            {!authLoading && <ArrowRight className="h-4 w-4" />}
          </Button>

          <p className="mt-6 text-center text-[14px] text-[#14181F] font-medium">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#04838C] hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
