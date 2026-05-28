"use client";

import { ArrowRight, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/stores/useStore";
import { toast } from "sonner";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 59;

export default function RegisterOtpVerificationPage() {
  const router = useRouter();
  const { verifyOtp, authLoading, resendOtp, registrationData } = useStore();
  const phone = registrationData?.phone || "";
  const phoneCode = registrationData?.phoneCode || "+1";
  const [digits, setDigits] = useState<string[]>(() =>
    Array(OTP_LENGTH).fill(""),
  );
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigitAt = useCallback((index: number, value: string) => {
    const d = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = d;
      return next;
    });
    return d;
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const focusInput = (index: number) => {
    const el = inputRefs.current[index];
    if (el) el.focus();
  };

  const handleChange = (index: number, raw: string) => {
    const d = setDigitAt(index, raw);
    if (d && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace") {
      if (digits[index]) {
        setDigits((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
      } else if (index > 0) {
        focusInput(index - 1);
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
    }
    if (key === "ArrowLeft" && index > 0) focusInput(index - 1);
    if (key === "ArrowRight" && index < OTP_LENGTH - 1) focusInput(index + 1);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const last = Math.min(pasted.length, OTP_LENGTH) - 1;
    focusInput(last >= 0 ? last : 0);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    const { success, error } = await verifyOtp({ phoneCode, phone, otp, isRegister: true });
    if (success) {
      router.push("/signup");
    } else {
      toast.error(error || "Invalid OTP. Please try again.");
    }
  };

  const handleResend = async () => {
    if (!phone) {
      toast.error("Phone number missing. Please go back.");
      return;
    }
    const { success, error } = await resendOtp({ phoneCode, phone });
    if (success) {
      toast.success("OTP resent successfully!");
      setSecondsLeft(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(""));
      focusInput(0);
    } else {
      toast.error(error || "Failed to resend OTP");
    }
  };

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
          <h2 className="text-[22px] font-semibold leading-tight text-[#111827] sm:text-[24px]">
            Verify your phone number
          </h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            We&apos;ve sent a 6-digit verification code to your phone
            number.
          </p>
        </div>

        <form className="mt-8 text-left" onSubmit={handleSubmit} noValidate>
          <div
            className="flex justify-center gap-2 sm:gap-3"
            role="group"
            aria-label="Enter 6-digit verification code"
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e.key)}
                onPaste={index === 0 ? handlePaste : undefined}
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                className="flex sm:h-[50px] sm:w-[50px] h-[40px] w-[40px] shrink-0 rounded-[10px] border border-[#E5E7EB] bg-white text-center sm:text-[18px] text-[16px] font-semibold text-[#111827] outline-none transition-colors focus-visible:border-[#03838C] focus-visible:ring-1 focus-visible:ring-[#03838C]/30"
              />
            ))}
          </div>

          <p className="mt-6 text-center text-[13px] text-[#6B7280] sm:text-[14px]">
            {secondsLeft > 0 ? (
              <>
                Not received yet? Resend after {secondsLeft}{" "}
                {secondsLeft === 1 ? "second" : "seconds"}
              </>
            ) : (
              <>
                Not received yet?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-semibold text-[#03838C] underline-offset-2 hover:underline cursor-pointer"
                >
                  Resend code
                </button>
              </>
            )}
          </p>

          <Button
            type="submit"
            disabled={authLoading}
            className="mt-6 h-12 w-full cursor-pointer rounded-[10px] bg-[#03838C] text-[16px] font-semibold text-white hover:bg-[#036D75] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {authLoading ? "Verifying..." : "Verify & Continue"}
            {!authLoading && <ArrowRight className="h-4 w-4" />}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="mt-3 h-12 w-full rounded-[10px] border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#111827] hover:bg-[#F9FAFB]"
            asChild
          >
            <Link href="/register">
              Change Phone Number
              <Phone className="h-4 w-4" />
            </Link>
          </Button>
        </form>
      </div>
    </div>
  );
}
