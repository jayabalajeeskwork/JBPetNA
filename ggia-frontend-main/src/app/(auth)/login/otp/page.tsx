 "use client";

import { ArrowRight, Check, Circle, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OtpLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [showIdentifierError, setShowIdentifierError] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowIdentifierError(identifier.trim().length === 0);
  };

  return (
    <div className="w-full max-w-[640px] text-center">
      <h1 className="text-[34px] font-semibold leading-tight text-[#111827] sm:text-[42px]">Log in to Ggia</h1>
      <p className="mt-2 text-sm text-[#6B7280] sm:text-[15px]">Access your groomer/daycare portal</p>

      <div className="mx-auto mt-8 w-full max-w-[560px] rounded-[18px] border border-[#EEF2F7] bg-white p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] sm:p-7">
        <div className="text-left">
          <h2 className="text-[30px] font-semibold leading-tight text-[#111827]">Log in to Ggia</h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">Access your groomer/daycare portal</p>
        </div>

        <form className="mt-6 text-left" noValidate onSubmit={handleSubmit}>
          <div>
            <label htmlFor="identifier" className="mb-2 block text-[14px] font-medium text-[#111827]">
              Email/Phone no. <span className="text-[#DC2626]">*</span>
            </label>
            <Input
              id="identifier"
              type="text"
              placeholder="Your email or mobile number"
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                if (showIdentifierError && event.target.value.trim().length > 0) {
                  setShowIdentifierError(false);
                }
              }}
              aria-invalid={showIdentifierError}
              aria-describedby={showIdentifierError ? "identifier-error" : undefined}
              className={`h-12 rounded-[10px] text-[14px] placeholder:text-[#9CA3AF] focus-visible:ring-1 ${
                showIdentifierError ? "border-[#F199A3]" : "border-[#E5E7EB]"
              }`}
            />
            {showIdentifierError ? (
              <p id="identifier-error" className="mt-2 text-[12px] text-[#DC2626]" role="alert">
                Email/Phone no. is required
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <label htmlFor="otp" className="mb-2 block text-[14px] font-medium text-[#111827]">
              OTP<span className="text-[#DC2626]">*</span>
            </label>
            <Input
              id="otp"
              type="text"
              placeholder="OTP"
              className="h-12 rounded-[10px] border-[#E5E7EB] text-[14px] placeholder:text-[#9CA3AF]"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] text-[#6B7F7C]">
            <input type="checkbox" className="peer sr-only" />
              <span className="flex h-[20px] w-[20px] items-center justify-center rounded-[6px] border-1 border-[#03838C] bg-white transition-colors peer-checked:border-[#03838C] peer-checked:bg-[#03838C] [&_svg]:opacity-0 [&_svg]:transition-opacity peer-checked:[&_svg]:opacity-100">
                <Check className="h-5 w-5 text-white" strokeWidth={1.8} />
              </span>
              Remember Me
            </label>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[14px] font-medium text-[#6B7280] hover:text-[#111827]"
            >
              <Circle className="h-3 w-3" />
              Resend OTP in 30s
            </button>
          </div>

          <Button
            type="submit"
            className="mt-5 h-12 w-full rounded-[10px] bg-[#03838C] text-[16px] font-semibold text-white hover:bg-[#036D75]"
          >
            Login
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="my-4 flex items-center gap-3 text-[#9CA3AF]">
            <div className="h-px flex-1 bg-[#E5E7EB]" />
            <span className="text-xs">or</span>
            <div className="h-px flex-1 bg-[#E5E7EB]" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-[10px] border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#111827] hover:bg-[#F9FAFB]"
          >
            Use Password instead
            <Lock className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
