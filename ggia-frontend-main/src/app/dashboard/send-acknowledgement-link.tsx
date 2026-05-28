"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  ArrowRight,
  Cat,
  Check,
  Dog,
  Mail,
  Phone,
  Search,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useStore } from "@/stores/useStore";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DOG_BREEDS, CAT_BREEDS } from "@/utils/constants";
import { formatPhoneNumber } from "@/utils/formatters";

const sendLinkSchema = z.object({
  ownerName: z.string().min(1, "Owner name is required"),
  emailOrPhone: z.string().min(1, "Email or phone is required"),
  breed: z
    .array(z.string())
    .min(1, "Breed is required")
    .max(2, "Select up to 2 breeds"),
  age: z.string().min(1, "Age is required"),
  address: z.string().min(1, "Address is required"),
});

type SendLinkValues = z.infer<typeof sendLinkSchema>;

type Channel = "Email" | "SMS";
type PetType = "Dog" | "Cat";

type SendAcknowledgementLinkSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkVia: Channel;
  setLinkVia: (channel: Channel) => void;
  petType: PetType;
  setPetType: (type: PetType) => void;
};

export function SendAcknowledgementLinkSheet({
  open,
  onOpenChange,
  linkVia,
  setLinkVia,
  petType,
  setPetType,
}: SendAcknowledgementLinkSheetProps) {
  const {
    sendAcknowledgmentLink,
    isSubmittingLink,
    searchOwner,
    searchOwnerLoading,
    searchedOwner,
    clearSearchedOwner,
    getAcknowledgments,
    addToDashboard,
    isSubmittingAcknowledgement,
    user,
  } = useStore();

  const handleAddToDashboard = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!searchedOwner?.owner?._id) return;

    const { success, error } = await addToDashboard({
      ownerId: searchedOwner.owner._id,
      userId: user?._id || user?.id || "",
      ownerName: watch("ownerName"),
    });

    if (success) {
      toast.success("Owner added to dashboard successfully!");
      await getAcknowledgments();
      onOpenChange(false);
    } else {
      toast.error(error || "Failed to add owner to dashboard");
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SendLinkValues>({
    resolver: zodResolver(sendLinkSchema),
    defaultValues: {
      ownerName: "",
      emailOrPhone: "",
      breed: [],
      age: "",
      address: "",
    },
  });

  const [breedSearch, setBreedSearch] = useState("");
  const [breedOpen, setBreedOpen] = useState(false);

  const emailOrPhoneValue = watch("emailOrPhone");

  // Debounce search
  useEffect(() => {
    if (!emailOrPhoneValue) {
      clearSearchedOwner();
      setPetType("Dog");
      setValue("breed", []);
      setValue("age", "");
      setValue("address", "");
      return;
    }

    const timer = setTimeout(() => {
      const type = linkVia === "Email" ? "email" : "phone";
      if (type === "phone" && emailOrPhoneValue.replace(/\D/g, "").length < 10) {
        clearSearchedOwner();
        setPetType("Dog");
        setValue("breed", []);
        setValue("age", "");
        setValue("address", "");
        return;
      }

      // Basic email validation check before calling
      if (type === "email" && !emailOrPhoneValue.includes("@")) {
        clearSearchedOwner();
        setPetType("Dog");
        setValue("breed", []);
        setValue("age", "");
        setValue("address", "");
        return;
      }

      searchOwner(
        type === "phone"
          ? emailOrPhoneValue.replace(/\D/g, "")
          : emailOrPhoneValue,
        type,
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [emailOrPhoneValue, linkVia, searchOwner, clearSearchedOwner]);

  // Auto-fill form when owner is found
  useEffect(() => {
    if (searchedOwner && searchedOwner.pets && searchedOwner.pets.length > 0) {
      const pet = searchedOwner.pets[0];
      setPetType(pet.type === 1 ? "Dog" : "Cat");
      setValue("ownerName", searchedOwner.owner?.name || "", { shouldValidate: true });
      setValue("breed", pet.breed || [], { shouldValidate: true });
      setValue("age", pet.age?.toString() || "", { shouldValidate: true });
      setValue("address", pet.address || "", { shouldValidate: true });
    } else {
      // Reset if not found
      setPetType("Dog");
      setValue("breed", []);
      setValue("age", "");
      setValue("address", "");
    }
  }, [searchedOwner, setPetType, setValue]);



  const onSubmit = async (values: SendLinkValues) => {
      const payload: any = {
        sendLinkVia: linkVia.toLowerCase(),
        ownerName: values.ownerName,
        petType: petType === "Dog" ? 1 : 2,
        breed: values.breed,
        age: parseInt(values.age),
        address: values.address,
      };

    if (linkVia === "Email") {
      payload.email = values.emailOrPhone;
    } else {
      payload.phone = values.emailOrPhone.replace(/\D/g, "");
    }

    const { success, error } = await sendAcknowledgmentLink(payload);

    if (success) {
      toast.success("Acknowledgement link sent successfully!");
      reset();
      clearSearchedOwner();
      await getAcknowledgments();
      onOpenChange(false);
    } else {
      toast.error(error || "Failed to send link");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-[520px] sm:max-w-[560px] sm:rounded-[24px] rounded-[0px] p-0 flex flex-col overflow-hidden">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto premium-scrollbar sm:px-4 px-4 sm:py-6 py-4">
            <SheetHeader className="mb-4 space-y-2 text-left relative">
              <SheetTitle className="text-[20px] font-[600] leading-[28px] text-[#111827]">
                Send Acknowledgement Link
              </SheetTitle>
              <SheetDescription className="text-[14px] leading-[20px] text-[#6B7280]">
                Send a pet licensing request to the owner
              </SheetDescription>
              <div className="absolute top-0 right-0">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 36 36"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.49818 26.3794C7.21672 26.6608 7.05859 27.0426 7.05859 27.4406C7.05859 27.8386 7.21672 28.2204 7.49818 28.5019C7.77964 28.7833 8.16138 28.9414 8.55943 28.9414C8.95747 28.9414 9.33922 28.7833 9.62068 28.5019L17.9982 20.1213L26.3772 28.5004C26.6601 28.7736 27.039 28.9248 27.4323 28.9214C27.8256 28.9179 28.2018 28.7602 28.4799 28.4821C28.758 28.204 28.9158 27.8277 28.9192 27.4345C28.9226 27.0412 28.7714 26.6623 28.4982 26.3794L20.1192 18.0004L28.4982 9.62135C28.7794 9.33989 28.9374 8.95823 28.9372 8.56032C28.9371 8.16241 28.7789 7.78086 28.4974 7.4996C28.216 7.21834 27.8343 7.06041 27.4364 7.06055C27.0385 7.06069 26.6569 7.21889 26.3757 7.50035L17.9982 15.8794L9.61918 7.50035C9.33627 7.22711 8.95737 7.07592 8.56408 7.07934C8.17078 7.08276 7.79456 7.24051 7.51645 7.51862C7.23834 7.79673 7.08058 8.17295 7.07717 8.56625C7.07375 8.95954 7.22494 9.33845 7.49818 9.62135L15.8772 18.0004L7.49818 26.3794Z"
                      fill="#657386"
                    />
                  </svg>
                </Button>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-5">
              <div className="rounded-[18px] border border-[#E5E7EB] bg-[#fff] p-[20px]">
                <p className="block text-[14px] font-[500] text-[#14181F] pb-[10px]">
                  Send Link via <span className="text-[#DC2828]">*</span>
                </p>
                <div className="grid grid-cols-2 border p-[4px] rounded-[12px]">
                  <button
                    type="button"
                    className={cn(
                      "flex items-center cursor-pointer justify-center gap-2 rounded-[12px] border px-3 py-3 text-[16px] font-[600] leading-[20px]",
                      linkVia === "SMS"
                        ? "border-0 bg-[#04838C] text-[#fff] rounded-[8px]"
                        : "border-0 bg-white text-[#6B7F7C]",
                    )}
                    onClick={() => {
                      setLinkVia("SMS");
                      setValue("emailOrPhone", "");
                      clearSearchedOwner();
                    }}
                  >
                    <Phone className="h-4 w-4" />
                    Mobile No.
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center cursor-pointer justify-center gap-2 rounded-[12px] border px-3 py-3 text-[16px] font-[600] leading-[20px]",
                      linkVia === "Email"
                        ? "border-0 bg-[#04838C] text-[#fff] rounded-[8px]"
                        : "border-0 bg-white text-[#6B7F7C]",
                    )}
                    onClick={() => {
                      setLinkVia("Email");
                      setValue("emailOrPhone", "");
                      clearSearchedOwner();
                    }}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                </div>

                <div className="mt-4 border-t border-[#DCE8E5] pt-[18px]">
                  <label className="block text-[14px] font-[500] leading-[20px] text-[#14181F] pb-[10px]">
                    Owner Name <span className="text-[#DC2828]">*</span>
                  </label>
                  <Input
                    {...register("ownerName")}
                    placeholder="Owner Name"
                    className={cn(
                      "h-[56px] rounded-[12px] border-[#E5E7EB] text-[14px]",
                      errors.ownerName && "border-[#DC2828]",
                    )}
                  />
                  {errors.ownerName && (
                    <p className="mt-1 text-[12px] text-[#DC2828]">
                      {errors.ownerName.message}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-[14px] font-[500] leading-[20px] text-[#14181F] pb-[10px]">
                    {linkVia === "SMS" ? "Phone Number" : "Email"}{" "}
                    <span className="text-[#DC2828]">*</span>
                  </label>
                  <div className="flex gap-2">
                    {linkVia === "SMS" && (
                      <div className="flex h-[56px] w-[60px] shrink-0 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white text-[14px] font-medium text-[#111827]">
                        +1
                      </div>
                    )}
                    <Input
                      {...register("emailOrPhone")}
                      placeholder={
                        linkVia === "SMS" ? "Phone Number" : "Email address"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (linkVia === "SMS") {
                          setValue("emailOrPhone", formatPhoneNumber(val), {
                            shouldValidate: true,
                          });
                        } else {
                          setValue("emailOrPhone", val, {
                            shouldValidate: true,
                          });
                        }
                      }}
                      className={cn(
                        "h-[56px] flex-1 rounded-[12px] border-[#E5E7EB] text-[14px]",
                        errors.emailOrPhone && "border-[#DC2828]",
                      )}
                    />
                  </div>
                  {errors.emailOrPhone && (
                    <p className="mt-1 text-[12px] text-[#DC2828]">
                      {errors.emailOrPhone.message ===
                      "Email or phone is required"
                        ? linkVia === "SMS"
                          ? "Phone number is required"
                          : "Email address is required"
                        : errors.emailOrPhone.message}
                    </p>
                  )}
                </div>

                {searchOwnerLoading && (
                  <div className="flex items-center gap-2 mt-2">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="animate-spin"
                      >
                        <g clipPath="url(#clip0_623_2163)">
                          <path
                            d="M10.0003 1.66602V4.99935M10.0003 14.9993V18.3327M4.10866 4.10768L6.46699 6.46602M13.5337 13.5327L15.892 15.891M1.66699 9.99935H5.00033M15.0003 9.99935H18.3337M4.10866 15.891L6.46699 13.5327M13.5337 6.46602L15.892 4.10768"
                            stroke="#6B7F7C"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_623_2163">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>{" "}
                    <p className="text-[14px] font-[500] leading-[20px] text-[#6B7F7C]">
                      Checking if this owner exists
                    </p>
                  </div>
                )}

                {!searchOwnerLoading &&
                  searchedOwner !== undefined &&
                  emailOrPhoneValue && (
                    <>
                      {searchedOwner ? (
                        <>
                          <div className="flex items-center gap-2 mt-2">
                            <span>
                              <Image
                                src="/images/1948767976.svg"
                                alt="check-circle"
                                width={20}
                                height={20}
                              />
                            </span>
                            <p className="text-[14px] font-[500] leading-[20px] text-[#11C468]">
                              Owner found
                            </p>
                          </div>

                          <div className="mt-4 flex flex-col gap-4 rounded-[14px] border border-[rgba(3,131,140,0.18)] bg-[linear-gradient(100deg,rgba(13,140,122,0.04)_0%,rgba(13,140,122,0.02)_100%)] p-[20px]">
                            {/* Acknowledgement Completed Badge */}
                            {searchedOwner.lastAcknowledgment && (
                              <div className="flex self-start">
                                <div className="flex items-center gap-1.5 rounded-full bg-[#E6F3F2] px-3 py-1 text-[12px] font-[500] text-[#03838C] border border-[rgba(3,131,140,0.18)]">
                                  <span>✓</span>
                                  <span>
                                    Acknowledgement Completed: {format(new Date(searchedOwner.lastAcknowledgment.updatedAt), "MMM,dd yyyy")}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-row items-center justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-[#03838C] text-[18px] font-[600] text-white uppercase">
                                  {searchedOwner.owner?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || "O"}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-[16px] font-[600] leading-5 text-[#1A2825]">
                                    {searchedOwner.owner?.name || "N/A"}
                                  </p>
                                  <p className="mt-0.5 text-[14px] font-normal leading-5 text-[#6B7F7C]">
                                    {searchedOwner.pets?.[0] ? (
                                      <>
                                        {searchedOwner.pets[0].name} · {searchedOwner.pets[0].sex === 1 ? "Male" : "Female"}, {searchedOwner.pets[0].breed?.[0]}
                                      </>
                                    ) : (
                                      "No pets registered"
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-2 text-[14px] font-[500] text-[#14181F]">
                                <Phone className="h-4 w-4 text-[#14181F]" />
                                {searchedOwner.owner?.phoneCode || "+1"}{" "}{searchedOwner.owner?.phone || "N/A"}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 mt-2">
                          <span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M10.4434 13.6191C10.2684 13.4441 9.99338 13.3941 9.76213 13.4879C9.68088 13.5191 9.61838 13.5629 9.55588 13.6191C9.49963 13.6816 9.45588 13.7504 9.42463 13.8254C9.39338 13.9004 9.37463 13.9816 9.37463 14.0629C9.37463 14.2316 9.43713 14.3879 9.55588 14.5066C9.67463 14.6254 9.83088 14.6879 9.99963 14.6879C10.1684 14.6879 10.3246 14.6254 10.4434 14.5066C10.5621 14.3879 10.6246 14.2316 10.6246 14.0629C10.6246 13.9816 10.6059 13.9004 10.5746 13.8254C10.5434 13.7504 10.4996 13.6816 10.4434 13.6191ZM17.5496 14.6691L11.6121 4.63164C11.2746 4.05664 10.6684 3.71289 9.99963 3.71289C9.33088 3.71289 8.72463 4.05664 8.38713 4.63164L2.44963 14.6691C2.09963 15.2566 2.09963 15.9629 2.43713 16.5504C2.77463 17.1441 3.38713 17.4941 4.06838 17.4941H15.9371C16.6184 17.4941 17.2246 17.1379 17.5684 16.5504C17.9059 15.9566 17.8996 15.2566 17.5559 14.6691H17.5496ZM16.4809 15.9316C16.4246 16.0254 16.2684 16.2441 15.9371 16.2441H4.06213C3.73713 16.2441 3.57463 16.0254 3.51838 15.9316C3.46213 15.8379 3.35588 15.5879 3.51838 15.3066L9.46213 5.26289C9.62463 4.98789 9.89338 4.95664 9.99963 4.95664C10.1059 4.95664 10.3746 4.98789 10.5371 5.26289L16.4746 15.3066C16.6434 15.5879 16.5309 15.8379 16.4746 15.9316H16.4809ZM10.0059 7.80664C9.66213 7.80664 9.38088 8.08789 9.38088 8.43164V12.2816C9.38088 12.6254 9.66213 12.9066 10.0059 12.9066C10.3496 12.9066 10.6309 12.6254 10.6309 12.2816V8.43164C10.6309 8.08789 10.3496 7.80664 10.0059 7.80664Z"
                                fill="#DC2828"
                              />
                            </svg>
                          </span>
                          <p className="text-[14px] font-[500] leading-[20px] text-[#DC2828]">
                            Owner not found.
                          </p>
                        </div>
                      )}
                    </>
                  )}
              </div>

                {!searchedOwner && (
                <div className="rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <div className="mb-4">
                    <p className="block text-[14px] font-[500] text-[#14181F] pb-[10px]">
                      Pet Type <span className="text-[#EF4444]">*</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className={cn(
                          "flex items-center cursor-pointer justify-center gap-2 rounded-[12px] border px-3 py-3 text-[16px] font-[500] leading-[20px] cursor-pointer",
                          petType === "Dog"
                            ? "border-0 bg-[#04838C] text-[#fff] rounded-[8px]"
                            : "border border-[#E5E7EB] text-[#4B5563] ",
                        )}
                        onClick={() => setPetType("Dog")}
                      >
                        <Dog className="h-4 w-4" />
                        Dog
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-[12px] border px-3 py-2 text-[16px] font-[500] leading-[20px] cursor-pointer",
                          petType === "Cat"
                            ? "border-0 bg-[#04838C] text-[#fff] rounded-[8px]"
                            : "border border-[#E5E7EB] text-[#4B5563] ",
                        )}
                        onClick={() => setPetType("Cat")}
                      >
                        <Cat className="h-4 w-4" />
                        Cat
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 relative">
                    <label className="block text-[14px] font-[500] leading-[20px] text-[#14181F] pb-[10px]">
                      Breed <span className="text-[#DC2828]">*</span>
                    </label>
                    <Popover open={breedOpen} onOpenChange={setBreedOpen}>
                      <PopoverTrigger asChild>
                        <div
                          className={cn(
                            "flex min-h-[48px] w-full flex-wrap items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-[35px] py-2 text-[14px] cursor-pointer",
                            errors.breed && "border-[#DC2828]",
                          )}
                        >
                          <span className="absolute left-3 top-[3.45rem] -translate-y-1/2">
                            <Search className="h-4 w-4 text-[#9CA3AF]" />
                          </span>
                          {watch("breed").length > 0 ? (
                            watch("breed").map((b) => (
                              <span
                                key={b}
                                className="inline-flex items-center gap-1 rounded-md bg-[#04838C]/10 px-2 py-1 text-[12px] font-medium text-[#04838C]"
                              >
                                {b}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = watch("breed");
                                    setValue(
                                      "breed",
                                      current.filter((item) => item !== b),
                                      { shouldValidate: true },
                                    );
                                  }}
                                />
                              </span>
                            ))
                          ) : (
                            <span className="text-[#9CA3AF]">
                              Search for breed (up to 2)
                            </span>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <div className="flex flex-col">
                          <div className="border-b p-2">
                            <Input
                              placeholder="Type to search..."
                              value={breedSearch}
                              onChange={(e) => setBreedSearch(e.target.value)}
                              className="h-9 border-0 focus-visible:ring-0"
                              autoFocus
                            />
                          </div>
                          <div
                            className="premium-scrollbar max-h-[200px] overflow-y-auto p-1"
                            onWheel={(e) => e.stopPropagation()}
                          >
                            {(petType === "Dog" ? DOG_BREEDS : CAT_BREEDS)
                              .filter((b) =>
                                b
                                  .toLowerCase()
                                  .includes(breedSearch.toLowerCase()),
                              )
                              .map((b) => {
                                const isSelected = watch("breed").includes(b);
                                const currentBreeds = watch("breed");
                                return (
                                  <div
                                    key={b}
                                    className={cn(
                                      "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-[14px] hover:bg-gray-100",
                                      isSelected && "bg-[#04838C]/5 font-medium",
                                      !isSelected &&
                                        currentBreeds.length >= 2 &&
                                        "pointer-events-none opacity-50",
                                    )}
                                    onClick={() => {
                                      if (isSelected) {
                                        setValue(
                                          "breed",
                                          currentBreeds.filter(
                                            (item) => item !== b,
                                          ),
                                          { shouldValidate: true },
                                        );
                                      } else if (currentBreeds.length < 2) {
                                        setValue("breed", [...currentBreeds, b], {
                                          shouldValidate: true,
                                        });
                                      }
                                    }}
                                  >
                                    {b}
                                    {isSelected && (
                                      <Check className="h-4 w-4 text-[#04838C]" />
                                    )}
                                  </div>
                                );
                              })}
                            {(petType === "Dog" ? DOG_BREEDS : CAT_BREEDS).filter(
                              (b) =>
                                b
                                  .toLowerCase()
                                  .includes(breedSearch.toLowerCase()),
                            ).length === 0 && (
                              <div className="px-3 py-4 text-center text-[14px] text-gray-500">
                                No breeds found
                              </div>
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {errors.breed && (
                      <p className="mt-1 text-[12px] text-[#DC2828]">
                        {errors.breed.message}
                      </p>
                    )}
                    <p className="text-[12px] leading-[16px] text-[#657386] pt-1">
                      Select up to 2 breeds for mixed breeds
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-[14px] font-[500] leading-[20px] text-[#14181F] pb-[10px]">
                      Age <span className="text-[#DC2828]">*</span>
                    </label>
                    <Select
                      onValueChange={(val) => setValue("age", val)}
                      value={watch("age")}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-[48px] rounded-[12px] border-[#E5E7EB] text-[14px]",
                          errors.age && "border-[#DC2828]",
                        )}
                      >
                        <SelectValue placeholder="Age" />
                      </SelectTrigger>
                      <SelectContent className="premium-scrollbar max-h-[300px]">
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((yr) => (
                          <SelectItem key={yr} value={yr.toString()}>
                            {yr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.age && (
                      <p className="mt-1 text-[12px] text-[#DC2828]">
                        {errors.age.message}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-[14px] font-[500] leading-[20px] text-[#14181F] pb-[10px]">
                      Address <span className="text-[#DC2828]">*</span>
                    </label>
                    <Input
                      {...register("address")}
                      placeholder="Address"
                      className={cn(
                        "h-[48px] rounded-[12px] border-[#E5E7EB] text-[14px] pl-[16px]",
                        errors.address && "border-[#DC2828]",
                      )}
                    />
                    {errors.address && (
                      <p className="mt-1 text-[12px] text-[#DC2828]">
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="mt-6 flex items-center justify-between gap-3 max-w-[440px] justify-center mx-auto pb-6">
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-[44px] w-[200px] rounded-[12px] border-[#E5E7EB] text-[14px] font-[500] text-[#111827]"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </SheetClose>
            <Button
              type={searchedOwner ? "button" : "submit"}
              onClick={searchedOwner ? handleAddToDashboard : undefined}
              disabled={isSubmittingLink || isSubmittingAcknowledgement}
              className="h-[44px] w-[200px] rounded-[12px] bg-[#03838C] text-[14px] font-[600] text-white hover:bg-[#036873]"
            >
              {isSubmittingLink || isSubmittingAcknowledgement ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : searchedOwner ? (
                <>
                  Add to Dashboard <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Send Link <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
