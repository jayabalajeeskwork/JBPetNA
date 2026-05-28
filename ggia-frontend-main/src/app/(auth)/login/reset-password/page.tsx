"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MIN_PASSWORD_LENGTH = 8;

type FieldErrors = {
  password?: string;
  confirmPassword?: string;
};

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = () => {
    const nextErrors: FieldErrors = {};
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedPassword) {
      nextErrors.password = "Password is required";
    } else if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    if (!trimmedConfirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required";
    } else if (!nextErrors.password && trimmedPassword !== trimmedConfirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
  };

  return (
    <div className="w-full max-w-[640px]">
      <div className="mx-auto w-full max-w-[560px] rounded-[18px] border border-[#EEF2F7] bg-white p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] sm:p-7">
        <div className="text-left">
          <h1 className="text-[30px] font-semibold leading-tight text-[#111827]">Reset Password</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">Please reset your password for login in future</p>
        </div>

        <form className="mt-6 text-left" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="password" className="mb-2 block text-[14px] font-medium text-[#111827]">
              Enter Password <span className="text-[#DC2626]">*</span>
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (errors.password) {
                  setErrors((previous) => ({ ...previous, password: undefined }));
                }
              }}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`h-12 rounded-[10px] text-[14px] placeholder:text-[#9CA3AF] focus-visible:ring-1 ${
                errors.password ? "border-[#F199A3]" : "border-[#E5E7EB]"
              }`}
            />
            {errors.password ? (
              <p id="password-error" className="mt-2 text-[12px] text-[#DC2626]" role="alert">
                {errors.password}
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <label htmlFor="confirmPassword" className="mb-2 block text-[14px] font-medium text-[#111827]">
              Confirm Password <span className="text-[#DC2626]">*</span>
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                if (errors.confirmPassword) {
                  setErrors((previous) => ({ ...previous, confirmPassword: undefined }));
                }
              }}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              className={`h-12 rounded-[10px] text-[14px] placeholder:text-[#9CA3AF] focus-visible:ring-1 ${
                errors.confirmPassword ? "border-[#F199A3]" : "border-[#E5E7EB]"
              }`}
            />
            {errors.confirmPassword ? (
              <p id="confirm-password-error" className="mt-2 text-[12px] text-[#DC2626]" role="alert">
                {errors.confirmPassword}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="mt-5 h-12 w-full rounded-[10px] bg-[#03838C] text-[16px] font-semibold text-white hover:bg-[#036D75]"
          >
            Submit
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
