"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const helperText = useMemo(
    () => "Enter your registered email or 10-digit mobile number",
    []
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = identifier.trim();

    if (!value) {
      setErrorMessage("Email/Phone no. is required");
      return;
    }

    const isEmail = EMAIL_REGEX.test(value);
    const isPhone = PHONE_REGEX.test(value);

    if (!isEmail && !isPhone) {
      setErrorMessage("Enter a valid email or 10-digit mobile number");
      return;
    }

    setErrorMessage("");
  };

  return (
    <div className="w-full max-w-[640px]">
      <div className="mx-auto w-full max-w-[560px] rounded-[18px] border border-[#EEF2F7] bg-white p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] sm:p-7">
        <div className="text-left">
          <h1 className="text-[30px] font-semibold leading-tight text-[#111827]">Forget Password</h1>
        </div>

        <form className="mt-6 text-left" onSubmit={handleSubmit} noValidate>
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
                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? "identifier-error" : "identifier-help"}
              className={`h-12 rounded-[10px] text-[14px] placeholder:text-[#9CA3AF] focus-visible:ring-1 ${
                errorMessage ? "border-[#F199A3]" : "border-[#E5E7EB]"
              }`}
            />
            {errorMessage ? (
              <p id="identifier-error" className="mt-2 text-[12px] text-[#DC2626]" role="alert">
                {errorMessage}
              </p>
            ) : (
              <p id="identifier-help" className="mt-2 text-[12px] text-[#6B7280]">
                {helperText}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="mt-5 h-12 w-full rounded-[10px] bg-[#03838C] text-[16px] font-semibold text-white hover:bg-[#036D75]"
          >
            Send Mail
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
