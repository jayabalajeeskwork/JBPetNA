"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { s3BaseUrl } from "@/utils/endpoints";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { Clock, Loader2, Check, ChevronsUpDown, Search } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import PetDetailsStep from "@/app/acknowledgement/PetDetailsStep";
import RequirementsStep from "./RequirementsStep";
import AcknowledgementChoiceStep from "@/app/acknowledgement/AcknowledgementChoiceStep";
import AcknowledgementCompleteStep from "@/app/acknowledgement/AcknowledgementCompleteStep";
import { useStore } from "@/stores/useStore";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/formatters";
import { AlertCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().min(1, "Phone is required"),
  municipality: z.string().min(1, "Select a municipality"),
  county: z.string().min(1, "Select a county"),
  rabiesShot: z
    .string()
    .min(1, "This field is required")
    .refine((val) => ["yes", "no"].includes(val), {
      message: "This field is required",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface SearchableDropdownProps {
  options: { _id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
}

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  icon,
}: SearchableDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery]);

  const selectedOption = options.find((option) => option._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-[46px] w-full justify-between rounded-[12px] border border-[#E5E7EB] bg-[#fff] px-[16px] text-[14px] font-[400] text-[#000] shadow-none hover:bg-white hover:border-[#03838C]/50 transition-all duration-300",
            !value && "text-[#657386]",
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {icon && <div className="shrink-0">{icon}</div>}
            <span className="truncate">
              {selectedOption ? selectedOption.name : placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-[12px] shadow-lg border border-[#E5E7EB]">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[#657386] disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto premium-scrollbar p-1">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#657386]">
              No options found.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option._id}
                onClick={() => {
                  onChange(option._id);
                  setOpen(false);
                  setSearchQuery("");
                }}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-[8px] px-3 py-2.5 text-sm outline-none hover:bg-[#F5F5F5] transition-colors",
                  value === option._id && "bg-[#03838C]/10 text-[#03838C]",
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option._id ? "opacity-100" : "opacity-0",
                  )}
                />
                {option.name}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default function AcknowledgementPageClient({
  token,
}: {
  token?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [showFileError, setShowFileError] = useState(false);
  const [extractionFailed, setExtractionFailed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acknowledgementId, setAcknowledgementId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasPrefilledRef = useRef(false);
  const hasPrefilledRabiesRef = useRef(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const rawStep = stepParam ? Number(stepParam) : 1;
  const currentStep = rawStep >= 1 && rawStep <= 5 ? rawStep : 1;
  const displayStep = currentStep >= 4 ? 4 : currentStep;

  const {
    municipalities,
    counties,
    fetchMunicipalities,
    fetchCounties,
    uploadFile,
    submitAcknowledgment,
    isCommonLoading,
    isDetailsLoading,
    isSubmittingAcknowledgement,
    getAcknowledgmentDetails,
    extractVaccineData,
    getExtractionStatus,
    isExtracting,
    acknowledgmentDetails,
  } = useStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      municipality: "",
      county: "",
      rabiesShot: "",
    },
  });

  useEffect(() => {
    fetchMunicipalities(500);
    fetchCounties();
  }, [fetchMunicipalities, fetchCounties]);

  useEffect(() => {
    if (token && !acknowledgmentDetails) {
      getAcknowledgmentDetails(token);
    }
  }, [token, getAcknowledgmentDetails, acknowledgmentDetails]);

  useEffect(() => {
    if (acknowledgmentDetails?.isFormCompleted && currentStep !== 5) {
      router.push(`/acknowledgement/${token}?step=5`);
    }
  }, [acknowledgmentDetails?.isFormCompleted, currentStep, router, token]);

  useEffect(() => {
    if (acknowledgmentDetails?.licenseOption === "municipality_site") {
      router.push(`/acknowledgement/${token}?step=4`);
    }
  }, [acknowledgmentDetails?.licenseOption]);

  useEffect(() => {
    if (acknowledgmentDetails) {
      const data = acknowledgmentDetails;
      setAcknowledgementId(data._id || data.id || "");
      if (!hasPrefilledRef.current && data.owner) {
        form.setValue("name", data.owner.name || "");
        form.setValue("email", data.owner.email || "");
        form.setValue("phone", formatPhoneNumber(data.owner.phone || ""));
        form.setValue("municipality", data.owner.municipality || "");
        form.setValue("county", data.owner.county || "");
        if (data.pet?.has_rabies_shot !== undefined) {
          form.setValue("rabiesShot", data.pet.has_rabies_shot ? "yes" : "no");
        }
        hasPrefilledRef.current = true;
      }
      const initialRabies = data.proofOfRabies || data.rabiesVaccinationReport || "";
      if (initialRabies && !hasPrefilledRabiesRef.current) {
        setFileUrl(initialRabies);
        hasPrefilledRabiesRef.current = true;
      }
    }
  }, [acknowledgmentDetails, form]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExtracting && acknowledgementId) {
      interval = setInterval(async () => {
        const res = await getExtractionStatus(acknowledgementId);
        if (res.success && res.data?.status === "COMPLETED") {
          toast.success("Vaccine data extracted successfully!");
          setExtractionFailed(false);
          setShowFileError(false);

          // Auto fill available fields for step-1 on unstract api response
          const details = res.data?.details;
          if (details) {
            if (details.owner_name) {
              form.setValue("name", details.owner_name, { shouldValidate: true });
            }
            if (details.email) {
              form.setValue("email", details.email, { shouldValidate: true });
            }
            if (details.phone_number) {
              form.setValue("phone", formatPhoneNumber(details.phone_number), { shouldValidate: true });
            }
            if (details.has_rabies_shot !== undefined) {
              form.setValue("rabiesShot", details.has_rabies_shot ? "yes" : "no", { shouldValidate: true });
            }
          }
        } else if (res.success && res.data?.status === "FAILED") {
          toast.error(
            "Vaccine data extraction failed. Please enter details manually.",
          );
          setExtractionFailed(true);
          setShowFileError(true);
        } else if (!res.success) {
          toast.error(res.error || "Failed to get extraction status");
          setExtractionFailed(true);
          setShowFileError(true);
        }
      }, 60000); // 60 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isExtracting,
    acknowledgementId,
    getExtractionStatus,
    getAcknowledgmentDetails,
    token,
    form,
  ]);

  const handleSubmit = async (values: FormValues) => {
    if (values.rabiesShot === "yes" && !file && !fileUrl) {
      setShowFileError(true);
      toast.error("Please upload your rabies vaccination report");
      return;
    }
    if (values.rabiesShot === "yes" && extractionFailed) {
      setShowFileError(true);
      toast.error("Vaccine data extraction failed. Please try again.");
      return;
    }
    setShowFileError(false);
    setIsSubmitting(true);
    let rabiesVaccinationReportUrl = null;

    if (values.rabiesShot === "yes") {
      if (file) {
        if (!fileUrl) {
          setIsFileUploading(true);
          const uploadRes = await uploadFile(file);
          setIsFileUploading(false);
          if (uploadRes.success && uploadRes.url) {
            const fileName = uploadRes.url.split("/").pop();
            rabiesVaccinationReportUrl = `${s3BaseUrl}/${fileName}`;
          } else {
            toast.error(uploadRes.error || "File upload failed");
            setIsSubmitting(false);
            return;
          }
        } else {
          const fileName = fileUrl.split("/").pop();
          rabiesVaccinationReportUrl = `${s3BaseUrl}/${fileName}`;
        }
      } else if (fileUrl) {
        const fileName = fileUrl.split("/").pop();
        rabiesVaccinationReportUrl = `${s3BaseUrl}/${fileName}`;
      }
    }

    const payload: any = {
      type: 1, // acknowledgmentType.OWNER_INFO
      name: values.name,
      email: values.email,
      phone: values.phone.replace(/\D/g, ""),
      municipality: values.municipality,
      county: values.county,
      acknowledgementId: acknowledgementId || undefined,
    };

    if (values.rabiesShot === "yes") {
      payload.rabiesVaccinationReport = rabiesVaccinationReportUrl;
    }

    const response = await submitAcknowledgment(payload);

    setIsSubmitting(false);

    if (response.success) {
      if (token) await getAcknowledgmentDetails(token);
      toast.success("Details submitted successfully!");
      const nextStep = "/acknowledgement/" + (token || "") + "?step=2";
      router.push(nextStep);
    } else {
      toast.error(response.error || "Submission failed");
    }
  };

  const handleFileProcess = async (f: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    const fileExtension = f.name.split(".").pop()?.toLowerCase();
    const isExtensionValid = ["jpg", "jpeg", "png", "pdf"].includes(fileExtension || "");
    const isTypeValid = validTypes.includes(f.type) || isExtensionValid;
    
    if (!isTypeValid) {
      toast.error("Invalid file type. Please upload a JPG, PNG, or PDF report.");
      return;
    }

    // Validate file size (8 MB limit)
    if (f.size > 8 * 1024 * 1024) {
      toast.error("File size too large. Maximum size allowed is 8 MB.");
      return;
    }

    setShowFileError(false);
    setExtractionFailed(false);
    setFile(f);
    setIsFileUploading(true);
    const res = await uploadFile(f);
    setIsFileUploading(false);
    if (res.success && res.url) {
      setFileUrl(res.url);
      toast.success("File uploaded successfully");

      if (acknowledgementId) {
        const fileName = res.url.split("/").pop();
        const s3Url = `${s3BaseUrl}/${fileName}`;

        const promise = extractVaccineData({ s3Url, acknowledgementId });
        toast.promise(promise, {
          loading: "Extracting vaccine data...",
          success: (res: any) => {
            if (res && !res.success) {
              setExtractionFailed(true);
              setShowFileError(true);
              return res.error || "Failed to extract vaccine data";
            }
            return "Extraction started successfully";
          },
          error: (err) => {
            setExtractionFailed(true);
            setShowFileError(true);
            return err.message || "Failed to extract vaccine data";
          },
        });
      }
    } else {
      toast.error(res.error || "Upload failed");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      handleFileProcess(f);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileProcess(f);
  };

  const isLoading =
    isCommonLoading ||
    isDetailsLoading ||
    isSubmittingAcknowledgement ||
    isExtracting;

  return (
    <div className="relative min-h-screen bg-white flex flex-col">
      <div className="fixed left-0 top-1/2 -translate-y-1/2 sm:block hidden -z-10 pointer-events-none">
        <Image
          src="/images/Background+Blur.svg"
          alt="Ggia"
          width={288}
          height={383}
        />
      </div>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 sm:block hidden -z-10 pointer-events-none">
        <Image
          src="/images/Background+Blur+2.svg"
          alt="Ggia"
          width={288}
          height={383}
        />
      </div>
      <header className="border-b border-[#EEE] ">
        <div className="py-4 px-4 sm:px-6 lg:px-8 w-full mx-auto flex items-center justify-between max-w-[1440px]">
          <Link href="/">
            <Image src="/images/logo.svg" alt="Ggia" width={59} height={32} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[#627084]">
            <a
              href="#secure"
              className="hover:text-[#03838C] transition-colors"
            >
              Secure & Private
            </a>
            <a
              href="#privacy"
              className="hover:text-[#03838C] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#support"
              className="hover:text-[#03838C] transition-colors"
            >
              Support
            </a>
          </nav>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-full border border-[#E5E7EB] p-2 text-[#627084] hover:border-[#03838C] hover:text-[#03838C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#03838C] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span className="sr-only">Toggle navigation</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden border-t border-[#EEE] bg-white">
            <div className="px-4 py-3 flex flex-col gap-2 text-sm text-[#627084]">
              <a
                href="#secure"
                className="py-2 hover:text-[#03838C] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Secure & Private
              </a>
              <a
                href="#privacy"
                className="py-2 hover:text-[#03838C] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Privacy Policy
              </a>
              <a
                href="#support"
                className="py-2 hover:text-[#03838C] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Support
              </a>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12">
        {currentStep === 5 && (
          <Image
            src="/images/Background6.svg"
            alt="step-1"
            className="mb-[30px]"
            width={100}
            height={100}
          />
        )}
        <h1 className="text-[30px] sm:text-[48px] font-bold text-[#14181F] text-center leading-[40px] sm:leading-[58px]">
          {currentStep === 2
            ? "Tell us about your pet"
            : currentStep === 5
              ? "Acknowledgement Complete"
              : "Pet License Acknowledgement"}
        </h1>
        <p className="text-[14px] sm:text-[18px] text-[#657386] sm:mt-[4px] mt-[10px] text-center ">
          {currentStep === 2
            ? "We need some basic information to check licensing requirements."
            : currentStep === 5
              ? "Thank you for completing your pet licensing acknowledgement."
              : "Complete your municipality compliance in under 2 minutes."}
        </p>

        {currentStep !== 5 && (
          <div className="w-full max-w-[448px] mt-6">
            <div className="h-[6px] bg-[#EAEDF0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#03838C] rounded-full"
                style={{ width: `${(displayStep / 4) * 100}%` }}
              />
            </div>
            <p className="text-[12px] sm:text-[14px] text-[#657386] mt-[8px] text-center ">
              Step {displayStep} of 4
            </p>
          </div>
        )}

        {currentStep === 1 ? (
          <Card className="w-full max-w-[640px] mt-[32px] border-0 sm:p-[38px] p-[18px] shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] rounded-[16px] bg-[#fff0] overflow-hidden">
            <CardHeader className="flex sm:flex-row flex-col sm:items-center items-start justify-between  p-0 ">
              <CardTitle className="sm:text-[24px] text-[20px] font-[700] text-[#171717]">
                Pet License Acknowledgement
              </CardTitle>
              <span className="inline-flex sm:items-center items-start gap-1 text-[12px] text-[#657386] bg-[#EAEDF0] sm:px-[12px] px-[10px] sm:py-[6px] py-[4px] rounded-full">
                <Clock className="sm:size-3.5 size-[14px] relative sm:top-0 top-[2px]" />
                ~2 minutes
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-[20px]"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<FormValues, "name">;
                    }) => (
                      <FormItem>
                        <FormLabel className="block text-[14px] font-medium text-[#14181F] mb-[0px]">
                          Your Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Your Name"
                            className={cn(
                              "h-[46px] rounded-[12px] border border-[#E5E7EB] bg-[#fff] px-[16px] sm:text-[16px] text-[14px] shadow-none font-[400] text-[#000] placeholder:text-[#657386] focus:outline-none focus:ring-0 focus:border-0 transition-all duration-300",
                              form.formState.errors.name
                                ? "border-red-500 focus-visible:ring-red-500/20"
                                : "border-input",
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<FormValues, "email">;
                    }) => (
                      <FormItem>
                        <FormLabel className="block text-[14px] font-medium text-[#14181F] mb-[0px]">
                          Email Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Email Address"
                            className="h-[46px] rounded-[12px] border border-[#E5E7EB] bg-[#fff] px-[16px] sm:text-[16px] text-[14px] shadow-none font-[400] text-[#000] placeholder:text-[#657386] focus:outline-none focus:ring-0 focus:border-0 transition-all duration-300"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-[12px] text-[#627084] ">
                          We&apos;ll send you a confirmation and any updates
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<FormValues, "phone">;
                    }) => (
                      <FormItem>
                        <FormLabel className="block text-[14px] font-medium text-[#14181F] mb-[0px]">
                          Phone Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <div className="flex h-[46px] w-[54px] shrink-0 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-[#fff] text-[14px] sm:text-[16px] text-[#000]">
                              +1
                            </div>
                            <Input
                              type="tel"
                              // placeholder="(555) 000-0000"
                              className="h-[46px] rounded-[12px] border border-[#E5E7EB] bg-[#fff] px-[16px] sm:text-[16px] text-[14px] shadow-none font-[400] text-[#000] placeholder:text-[#657386] focus:outline-none focus:ring-0 focus:border-0 transition-all duration-300"
                              {...field}
                              onChange={(e) => {
                                const formatted = formatPhoneNumber(
                                  e.target.value,
                                );
                                field.onChange(formatted);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-[12px] text-[#657386] ">
                          For important updates only
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="county"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<FormValues, "county">;
                    }) => (
                      <FormItem className="relative">
                        <FormLabel className="block text-[14px] font-medium text-[#14181F] mb-[0px]">
                          County <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <SearchableDropdown
                            options={counties}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="County"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="municipality"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<FormValues, "municipality">;
                    }) => (
                      <FormItem className="relative">
                        <FormLabel className="block text-[14px] font-medium text-[#14181F] mb-[0px]">
                          Municipality <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <SearchableDropdown
                            options={municipalities}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Municipality"
                            icon={
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <g clipPath="url(#clip0_461_476)">
                                  <path
                                    d="M13.3337 6.66634C13.3337 9.99501 9.64099 13.4617 8.40099 14.5323C8.28547 14.6192 8.14486 14.6662 8.00033 14.6662C7.85579 14.6662 7.71518 14.6192 7.59966 14.5323C6.35966 13.4617 2.66699 9.99501 2.66699 6.66634C2.66699 5.25185 3.2289 3.8953 4.22909 2.8951C5.22928 1.89491 6.58584 1.33301 8.00033 1.33301C9.41481 1.33301 10.7714 1.89491 11.7716 2.8951C12.7718 3.8953 13.3337 5.25185 13.3337 6.66634Z"
                                    stroke="#657386"
                                    strokeWidth="1.33333"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M7.99951 8.66602C9.10381 8.66602 9.99902 7.7708 9.99902 6.6665C9.99902 5.5622 9.10381 4.66699 7.99951 4.66699C6.89521 4.66699 6 5.5622 6 6.6665C6 7.7708 6.89521 8.66602 7.99951 8.66602Z"
                                    stroke="#657386"
                                    strokeWidth="1.33333"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_461_476">
                                    <rect width="16" height="16" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-[12px] text-[#657386] ">
                          This determines licensing requirements and fees
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rabiesShot"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<FormValues, "rabiesShot">;
                    }) => (
                      <FormItem>
                        <FormLabel className="block text-[14px] font-medium text-[#14181F] mb-[10px]">
                          Do you have Rabies Shot?{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-[12px]">
                            <Button
                              type="button"
                              onClick={() => field.onChange("yes")}
                              className={cn(
                                "flex-1 sm:h-[56px] h-[46px] sm:rounded-[16px] rounded-[12px] font-medium cursor-pointer",
                                field.value === "yes"
                                  ? "bg-[#03838C] text-white hover:bg-[#036b73]"
                                  : cn(
                                      "bg-white border text-[#627084] hover:bg-[#F5F5F5]",
                                      form.formState.errors.rabiesShot
                                        ? "border-red-500"
                                        : "border-input",
                                    ),
                              )}
                            >
                              Yes
                            </Button>
                            <Button
                              type="button"
                              onClick={() => field.onChange("no")}
                              variant="outline"
                              className={cn(
                                "flex-1 sm:h-[56px] h-[46px] sm:rounded-[16px] rounded-[12px] font-medium cursor-pointer",
                                field.value === "no"
                                  ? "bg-[#03838C] text-white hover:bg-[#036b73] border-[#03838C] hover:text-white"
                                  : cn(
                                      "border text-[#627084] hover:bg-[#F5F5F5]",
                                      form.formState.errors.rabiesShot
                                        ? "border-red-500"
                                        : "border-input",
                                    ),
                              )}
                            >
                              No
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription className="text-[12px] text-[#657386]">
                          This helps to fill the form faster
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("rabiesShot") === "yes" && (
                    <div>
                      <label className="block text-[14px] font-medium text-[#14181F] sm:mb-[12px] mb-[10px]">
                        Rabies Vaccination Report
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="sr-only"
                        id="rabies-upload"
                        disabled={isFileUploading || isExtracting}
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          !(isFileUploading || isExtracting) &&
                          fileInputRef.current?.click()
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          !(isFileUploading || isExtracting) &&
                          fileInputRef.current?.click()
                        }
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (!(isFileUploading || isExtracting)) {
                            setIsDragging(true);
                          }
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          if (isFileUploading || isExtracting) {
                            e.preventDefault();
                            return;
                          }
                          handleDrop(e);
                        }}
                        className={cn(
                          "border-2 border-dashed rounded-[20px] sm:p-8 p-[16px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
                          isDragging
                            ? "border-[#03838C] bg-[#03838C]/5"
                            : "border-[#E5E7EB] hover:border-[#03838C]/50",
                          (file || fileUrl) && "border-[#03838C] bg-[#03838C]/5",
                          showFileError && "border-[#DC2828] bg-[#DC2828]/5",
                          (isFileUploading || isExtracting) &&
                            "opacity-50 cursor-not-allowed pointer-events-none",
                        )}
                      >
                        {file || fileUrl ? (
                          <div className="flex items-center justify-center bg-[#E0F4F5] rounded-full p-2.5">
                            <Check className="h-6 w-6 text-[#03838C]" />
                          </div>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="26"
                            height="26"
                            viewBox="0 0 26 26"
                            fill="none"
                          >
                            <path
                              d="M23.834 14.084C23.5467 14.084 23.2711 14.1981 23.0679 14.4013C22.8648 14.6044 22.7506 14.88 22.7506 15.1673V19.7314C22.7498 20.5319 22.4314 21.2993 21.8654 21.8654C21.2993 22.4314 20.5319 22.7498 19.7314 22.7507H6.2699C5.46941 22.7498 4.70195 22.4314 4.13592 21.8654C3.56989 21.2993 3.25151 20.5319 3.25065 19.7314V15.1673C3.25065 14.88 3.13651 14.6044 2.93335 14.4013C2.73019 14.1981 2.45464 14.084 2.16732 14.084C1.88 14.084 1.60445 14.1981 1.40129 14.4013C1.19812 14.6044 1.08398 14.88 1.08398 15.1673V19.7314C1.08542 21.1064 1.63225 22.4246 2.60449 23.3968C3.57673 24.3691 4.89495 24.9159 6.2699 24.9173H19.7314C21.1063 24.9159 22.4246 24.3691 23.3968 23.3968C24.3691 22.4246 24.9159 21.1064 24.9173 19.7314V15.1673C24.9173 14.88 24.8032 14.6044 24.6 14.4013C24.3969 14.1981 24.1213 14.084 23.834 14.084Z"
                              fill={showFileError ? "#DC2828" : "#03838C"}
                            />
                            <path
                              d="M7.2666 9.433L11.9174 4.78225V18.4171C11.9174 18.7044 12.0315 18.98 12.2347 19.1831C12.4378 19.3863 12.7134 19.5004 13.0007 19.5004C13.288 19.5004 13.5636 19.3863 13.7667 19.1831C13.9699 18.98 14.084 18.7044 14.084 18.4171V4.78225L18.7348 9.433C18.9391 9.63034 19.2127 9.73953 19.4968 9.73707C19.7808 9.7346 20.0525 9.62067 20.2534 9.41981C20.4543 9.21895 20.5682 8.94723 20.5707 8.66319C20.5731 8.37914 20.4639 8.10549 20.2666 7.90117L13.7666 1.40117C13.5634 1.19808 13.2879 1.08398 13.0007 1.08398C12.7134 1.08398 12.4379 1.19808 12.2348 1.40117L5.73477 7.90117C5.53743 8.10549 5.42824 8.37914 5.43071 8.66319C5.43317 8.94723 5.54711 9.21895 5.74797 9.41981C5.94882 9.62067 6.22054 9.7346 6.50458 9.73707C6.78863 9.73953 7.06228 9.63034 7.2666 9.433Z"
                              fill={showFileError ? "#DC2828" : "#03838C"}
                            />
                          </svg>
                        )}
                        <span
                          className={cn(
                            "sm:text-[16px] text-[14px] font-[700] flex items-center gap-2",
                            showFileError ? "text-[#DC2828]" : "text-[#657386]",
                          )}
                        >
                          {isFileUploading && (
                            <Loader2 className="h-4 w-4 animate-spin text-[#03838C]" />
                          )}
                          {isFileUploading
                            ? "Uploading..."
                            : file
                              ? file.name
                              : fileUrl
                                ? fileUrl.split("/").pop()
                                : "Drop file here or click to browse"}
                        </span>
                        <span
                          className={cn(
                            "text-[12px]",
                            showFileError ? "text-[#DC2828]" : "text-[#657386]",
                          )}
                        >
                          {fileUrl || file
                            ? "Click or drag a new file to replace the existing one"
                            : "You can upload JPG, PNG, PDF (up to 8 MB)"}
                        </span>
                      </div>
                      {showFileError && (
                        <div className="flex items-center gap-2 mt-2 text-[#DC2828]">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[12px]">
                            {extractionFailed
                              ? "Vaccine data extraction failed. Please upload a valid rabies vaccination report."
                              : "Please upload your rabies vaccination report"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isFileUploading || isSubmitting || isExtracting}
                    className="w-full h-[46px] cursor-pointer rounded-[12px] bg-[#03838C] hover:bg-[#036b73] text-white font-[600] sm:text-[16px] text-[14px] mt-2 disabled:opacity-50"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Extracting vaccine data...
                      </>
                    ) : isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Start Acknowledgement Process
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M4.16699 10H15.8337"
                            stroke="white"
                            strokeWidth="1.66667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10 4.16602L15.8333 9.99935L10 15.8327"
                            stroke="white"
                            strokeWidth="1.66667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : currentStep === 2 ? (
          <PetDetailsStep
            token={token}
            onBack={() =>
              router.push("/acknowledgement/" + (token || "") + "?step=1")
            }
            onContinue={() =>
              router.push("/acknowledgement/" + (token || "") + "?step=3")
            }
          />
        ) : currentStep === 3 ? (
          <RequirementsStep
            onBack={() =>
              router.push("/acknowledgement/" + (token || "") + "?step=2")
            }
            onContinue={() =>
              router.push("/acknowledgement/" + (token || "") + "?step=4")
            }
          />
        ) : currentStep === 4 ? (
          <AcknowledgementChoiceStep
            token={token || ""}
            onBack={() =>
              router.push("/acknowledgement/" + (token || "") + "?step=3")
            }
            onContinue={() => {
              router.push("/acknowledgement/" + (token || "") + "?step=5");
            }}
          />
        ) : (
          <AcknowledgementCompleteStep
            onClose={() => {
              router.push("/");
            }}
          />
        )}

        <p className="text-[14px] text-[#657386] sm:mt-[40px] mt-[20px] text-center">
          Need help? Contact support at{" "}
          <a
            href="mailto:support@ggia.com"
            className="text-[#14181F]  font-medium underline block"
          >
            support@ggia.com
          </a>
        </p>
      </main>
    </div>
  );
}
