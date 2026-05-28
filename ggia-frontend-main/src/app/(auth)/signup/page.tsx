"use client";

import {
  ArrowRight,
  Check,
  Clock,
  Eye,
  EyeOff,
  MapPin,
  Search,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, FormEvent } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/stores/useStore";
import { toast } from "sonner";
import { BUSINESS_TYPE_OPTIONS } from "@/utils/constants";

const signupSchema = z
  .object({
    businessName: z.string().min(1, "Business name is required"),
    businessType: z.number().min(1, "Business type is required"),
    businessAddress: z.string().min(1, "Business address is required"),
    contactPerson: z.string().min(1, "Contact person name is required"),
    sameAsBusinessOwner: z.boolean(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const RESEND_SECONDS = 59;
const OTP_LENGTH = 6;

export default function SignupPage() {
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

  const {
    verifyOtp,
    signup,
    resendOtp,
    signupLoading,
    verifyOtpLoading,
    resendOtpLoading,
    registrationData,
  } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // OTP Dialog State
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(() =>
    Array(OTP_LENGTH).fill(""),
  );
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(RESEND_SECONDS);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      businessName: "",
      businessType: 0,
      businessAddress: "",
      contactPerson: "",
      sameAsBusinessOwner: false,
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const setOtpDigitAt = useCallback((index: number, value: string) => {
    const d = value.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = d;
      return next;
    });
    return d;
  }, []);

  const focusOtpInput = (index: number) => {
    const el = otpInputRefs.current[index];
    if (el) el.focus();
  };

  const handleOtpChange = (index: number, raw: string) => {
    const d = setOtpDigitAt(index, raw);
    if (d && index < OTP_LENGTH - 1) {
      focusOtpInput(index + 1);
    }
  };

  const handleOtpKeyDown = (index: number, key: string) => {
    if (key === "Backspace") {
      if (otpDigits[index]) {
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
      } else if (index > 0) {
        focusOtpInput(index - 1);
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
    }
    if (key === "ArrowLeft" && index > 0) focusOtpInput(index - 1);
    if (key === "ArrowRight" && index < OTP_LENGTH - 1)
      focusOtpInput(index + 1);
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);
    const last = Math.min(pasted.length, OTP_LENGTH) - 1;
    focusOtpInput(last >= 0 ? last : 0);
  };

  const handleOtpResend = () => {
    setOtpSecondsLeft(RESEND_SECONDS);
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    focusOtpInput(0);
  };

  useEffect(() => {
    if (!emailVerificationOpen) return;
    const id = window.setInterval(() => {
      setOtpSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [emailVerificationOpen]);

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    if (!registrationData) {
      toast.error("Phone verification data missing. Please go back.");
      return;
    }

    const payload = {
      ...data,
      phoneCode: registrationData.phoneCode,
      phone: registrationData.phone,
    };

    const { success, error } = await signup(payload);
    if (success) {
      setEmailVerificationOpen(true);
      setOtpSecondsLeft(RESEND_SECONDS);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
    } else {
      toast.error(error || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length < OTP_LENGTH) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    const formData = watch();
    if (!registrationData) {
      toast.error("Phone verification data missing. Please go back.");
      return;
    }

    // Step 1: Verify OTP
    const verifyResp = await verifyOtp({
      email: formData.email,
      otp,
      isRegister: true,
    });

    if (verifyResp.success) {
      // Step 2: Signup
      const signupPayload = {
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        contactPerson: formData.contactPerson,
        sameAsBusinessOwner: formData.sameAsBusinessOwner,
        email: formData.email,
        phoneCode: registrationData.phoneCode,
        phone: registrationData.phone,
        businessType: formData.businessType,
        password: formData.password,
      };

      const signupResp = await signup(signupPayload);
      if (signupResp.success) {
        // toast.success("Account created successfully!");
        setEmailVerificationOpen(false);
        router.push("/dashboard");
      } else {
        toast.error(signupResp.error || "Signup failed");
      }
    } else {
      toast.error(verifyResp.error || "Invalid OTP. Please try again.");
    }
  };

  const sameAsOwner = watch("sameAsBusinessOwner");
  const businessNameValue = watch("businessName");

  useEffect(() => {
    if (sameAsOwner) {
      setValue("contactPerson", businessNameValue || "");
    }
  }, [sameAsOwner, businessNameValue, setValue]);

  if (isRedirecting) return null;

  return (
    <>
      <div className="w-full max-w-[640px] text-center">
        <h1 className="text-[34px] font-semibold leading-tight text-[#111827] sm:text-[42px]">
          Create your Ggia business account
        </h1>
        <p className="mt-2 text-sm text-[#6B7280] sm:text-[15px]">
          Start sending acknowledgement links right away in under 2 minutes.
        </p>

        <div className="mx-auto mt-6 w-full max-w-[560px]">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
            <div className="h-full w-1/2 rounded-full bg-[#03838C]" />
          </div>
          <p className="mt-2 text-left text-[13px] text-[#6B7280] sm:text-[14px]">
            Step 2: Business details
          </p>
        </div>

        <div className="mx-auto mt-6 w-full max-w-[560px] rounded-[18px] bg-white p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] sm:p-10">
          <div className="flex flex-col items-start justify-between gap-3 text-left sm:flex-row sm:items-center">
            <h2 className="text-[22px] font-semibold leading-tight text-[#111827] sm:text-[24px]">
              Business Details
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-[13px] text-[#6B7280]">
              <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              ~2 minutes
            </span>
          </div>

          <form
            className="mt-8 text-left"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div>
              <label
                htmlFor="businessName"
                className="mb-2 block text-[14px] font-medium text-[#14181F]"
              >
                Business Name
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9CA3AF]"
                  strokeWidth={2}
                />
                <Input
                  id="businessName"
                  {...register("businessName")}
                  placeholder="Search for your business to save time"
                  className={`h-12 rounded-[10px] border-[#E5E7EB] pl-10 text-[14px] placeholder:text-[#9CA3AF] focus-visible:border-[#03838C] focus-visible:ring-1 focus-visible:ring-[#03838C]/30 ${
                    errors.businessName ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.businessName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div className="mt-5">
              <label
                htmlFor="businessType"
                className="mb-2 block text-[14px] font-medium text-[#14181F]"
              >
                Business Type
              </label>
              <Select
                onValueChange={(value) =>
                  setValue("businessType", Number(value), {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  id="businessType"
                  className="h-12 w-full rounded-[10px] border-[#E5E7EB] text-[14px] text-[#111827] focus:ring-1 focus:ring-[#03838C]/30 data-[placeholder]:text-[#9CA3AF]"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-[10px] border-[#E5E7EB]">
                  {BUSINESS_TYPE_OPTIONS.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value.toString()}
                      className="text-[14px]"
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessType && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.businessType.message}
                </p>
              )}
            </div>

            <div className="mt-5">
              <label
                htmlFor="businessAddress"
                className="mb-2 block text-[14px] font-medium text-[#14181F]"
              >
                Business Address
              </label>
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9CA3AF]"
                  strokeWidth={2}
                />
                <Input
                  id="businessAddress"
                  {...register("businessAddress")}
                  placeholder="Start typing your address..."
                  className={`h-12 rounded-[10px] border-[#E5E7EB] pl-10 text-[14px] placeholder:text-[#9CA3AF] focus-visible:border-[#03838C] focus-visible:ring-1 focus-visible:ring-[#03838C]/30 ${
                    errors.businessAddress ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.businessAddress && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.businessAddress.message}
                </p>
              )}
            </div>

            <div className="mt-8">
              <div className="mt-5">
                <label
                  htmlFor="contactPerson"
                  className="mb-2 block text-[14px] font-medium text-[#14181F]"
                >
                  Point Person (Contact Person)
                </label>
                <Input
                  id="contactPerson"
                  {...register("contactPerson")}
                  placeholder="Full Name"
                  disabled={sameAsOwner}
                  className={`h-12 rounded-[10px] border-[#E5E7EB] text-[14px] placeholder:text-[#9CA3AF] focus-visible:border-[#03838C] focus-visible:ring-1 focus-visible:ring-[#03838C]/30 disabled:bg-[#F9FAFB] ${
                    errors.contactPerson ? "border-red-500" : ""
                  }`}
                />
                {errors.contactPerson && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.contactPerson.message}
                  </p>
                )}
              </div>

              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-[14px] text-[#6B7F7C]">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  {...register("sameAsBusinessOwner")}
                />
                <span className="flex h-[20px] w-[20px] items-center justify-center rounded-[6px] border border-[#03838C] bg-white transition-colors peer-checked:border-[#03838C] peer-checked:bg-[#03838C] [&_svg]:opacity-0 [&_svg]:transition-opacity peer-checked:[&_svg]:opacity-100">
                  <Check className="h-5 w-5 text-white" strokeWidth={1.8} />
                </span>
                Same as business owner
              </label>

              <div className="mt-5">
                <label
                  htmlFor="email"
                  className="mb-2 block text-[14px] font-medium text-[#14181F]"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Email Address"
                  onChange={(e) => {
                    const val = e.target.value;
                    setValue("email", val, { shouldValidate: true });
                  }}
                  className={`h-12 rounded-[10px] border-[#E5E7EB] text-[14px] placeholder:text-[#9CA3AF] focus-visible:border-[#03838C] focus-visible:ring-1 focus-visible:ring-[#03838C]/30 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    Please enter a valid email address
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="password"
                className="mb-2 block text-[14px] font-medium text-[#14181F]"
              >
                Password <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Your Password"
                  className={`h-12 rounded-[10px] border-[#E5E7EB] pr-11 text-[14px] placeholder:text-[#9CA3AF] focus-visible:border-[#03838C] focus-visible:ring-1 focus-visible:ring-[#03838C]/30 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors hover:text-[#14181F] cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="mt-5">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-[14px] font-medium text-[#14181F]"
              >
                Confirm Password <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Re-write Your Password"
                  className={`h-12 rounded-[10px] border-[#E5E7EB] pr-11 text-[14px] placeholder:text-[#9CA3AF] focus-visible:border-[#03838C] focus-visible:ring-1 focus-visible:ring-[#03838C]/30 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors hover:text-[#14181F] cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={signupLoading}
              className="mt-8 h-12 w-full rounded-[10px] bg-[#03838C] text-[16px] font-semibold text-white hover:bg-[#036D75] disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2"
            >
              {signupLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      <Dialog
        open={emailVerificationOpen}
        onOpenChange={setEmailVerificationOpen}
      >
        <DialogContent className="max-w-[min(calc(100vw-2rem),420px)] gap-0 rounded-[18px] p-6 sm:p-8">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>Email Verification</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              We&apos;ve sent a 6-digit verification code to your email.
            </DialogDescription>
          </DialogHeader>

          <form
            className="mt-6 text-left"
            onSubmit={handleVerifyOtp}
            noValidate
          >
            <div
              className="flex justify-center gap-2 sm:gap-3"
              role="group"
              aria-label="Enter 6-digit email verification code"
            >
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e.key)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                  className="h-[40px] w-[40px] shrink-0 rounded-[10px] border border-[#E5E7EB] bg-white text-center text-[16px] font-semibold text-[#111827] outline-none transition-colors focus-visible:border-[#03838C] focus-visible:ring-1 focus-visible:ring-[#03838C]/30 sm:h-[50px] sm:w-[50px] sm:text-[18px]"
                />
              ))}
            </div>

            <p className="mt-6 text-center text-[13px] text-[#6B7280] sm:text-[14px]">
              {otpSecondsLeft > 0 ? (
                <>
                  Not received yet? Resend after {otpSecondsLeft}{" "}
                  {otpSecondsLeft === 1 ? "second" : "seconds"}
                </>
              ) : (
                <>
                  Not received yet?{" "}
                  <button
                    type="button"
                    onClick={handleOtpResend}
                    disabled={resendOtpLoading}
                    className="font-semibold text-[#03838C] underline-offset-2 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                  >
                    {resendOtpLoading && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    Resend code
                  </button>
                </>
              )}
            </p>

            <Button
              type="submit"
              disabled={verifyOtpLoading}
              className="mt-6 h-12 w-full cursor-pointer rounded-[10px] bg-[#03838C] text-[16px] font-semibold text-white hover:bg-[#036D75] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {verifyOtpLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify OTP
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
