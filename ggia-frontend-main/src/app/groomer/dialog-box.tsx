"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  ArrowRight,
  Cat,
  Dog,
  Mail,
  Phone,
  Search,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatPhoneNumber } from "@/utils/formatters";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useStore } from "@/stores/useStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DOG_BREEDS, CAT_BREEDS } from "@/utils/constants";

type LinkChannel = "mobile" | "email";
type PetType = "Dog" | "Cat";

export type SendAcknowledgementLinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginInstead?: () => void;
  onSendLink?: () => void;
};

const sendLinkSchema = z.object({
  businessPhone: z.string().min(14, "Valid phone number is required"), // +1 (XXX) XXX-XXXX is 17 chars, but 14 is min for formatted
  businessName: z.string().min(1, "Business name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  ownerContact: z.string().min(1, "Owner contact is required"),
  breed: z
    .array(z.string())
    .min(1, "Breed is required")
    .max(2, "Select up to 2 breeds"),
  age: z.string().min(1, "Age is required"),
  address: z.string().min(1, "Address is required"),
});

type SendLinkValues = z.infer<typeof sendLinkSchema>;

export function SendAcknowledgementLinkDialog({
  open,
  onOpenChange,
  onLoginInstead,
  onSendLink,
}: SendAcknowledgementLinkDialogProps) {
  const [linkVia, setLinkVia] = React.useState<LinkChannel>("mobile");
  const [petType, setPetType] = React.useState<PetType>("Dog");
  const [breedSearch, setBreedSearch] = React.useState("");
  const [breedOpen, setBreedOpen] = React.useState(false);

  const {
    searchOwner,
    searchOwnerLoading,
    searchedOwner,
    clearSearchedOwner,
    searchGroomer,
    searchGroomerLoading,
    searchedGroomer,
    clearSearchedGroomer,
    sendAcknowledgmentLink,
    isSubmittingLink,
    getAcknowledgments,
    addToDashboard,
    isSubmittingAcknowledgement,
  } = useStore();

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
      businessPhone: "",
      businessName: "",
      ownerName: "",
      ownerContact: "",
      breed: [],
      age: "",
      address: "",
    },
  });

  const businessPhone = watch("businessPhone");
  const ownerContact = watch("ownerContact");

  React.useEffect(() => {
    if (!ownerContact) {
      clearSearchedOwner();
      setPetType("Dog");
      setValue("breed", []);
      setValue("age", "");
      setValue("address", "");
      return;
    }

    const timer = setTimeout(async () => {
      const type = linkVia === "mobile" ? "phone" : "email";
      if (type === "phone" && ownerContact.replace(/\D/g, "").length < 10) {
        clearSearchedOwner();
        setPetType("Dog");
        setValue("breed", []);
        setValue("age", "");
        setValue("address", "");
        return;
      }
      if (type === "email" && !ownerContact.includes("@")) {
        clearSearchedOwner();
        setPetType("Dog");
        setValue("breed", []);
        setValue("age", "");
        setValue("address", "");
        return;
      }

      const { success, data } = await searchOwner(
        type === "phone" ? ownerContact.replace(/\D/g, "") : ownerContact,
        type,
      );

      if (success && data && data.pets && data.pets.length > 0) {
        const pet = data.pets[0];
        setPetType(pet.type === 1 ? "Dog" : "Cat");
        setValue("ownerName", data.owner?.name || "", { shouldValidate: true });
        setValue("breed", pet.breed || [], { shouldValidate: true });
        setValue("age", pet.age?.toString() || "", { shouldValidate: true });
        setValue("address", pet.address || "", { shouldValidate: true });
      } else {
        // Reset pet info if owner is not found
        setPetType("Dog");
        setValue("breed", []);
        setValue("age", "");
        setValue("address", "");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [ownerContact, linkVia, searchOwner, clearSearchedOwner, setValue]);

  React.useEffect(() => {
    if (!businessPhone || businessPhone.replace(/\D/g, "").length < 10) {
      clearSearchedGroomer();
      setValue("businessName", "");
      return;
    }

    const timer = setTimeout(async () => {
      const phone = businessPhone.replace(/\D/g, "");
      const { success, data } = await searchGroomer(phone);
      if (success && data) {
        setValue("businessName", data.businessName || "", {
          shouldValidate: true,
        });
      } else {
        setValue("businessName", "");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [businessPhone, searchGroomer, clearSearchedGroomer, setValue]);

  const onSubmit = async (values: SendLinkValues) => {
    const payload: any = {
      sendLinkVia: linkVia.toLowerCase(),
      ownerName: values.ownerName,
      petType: petType === "Dog" ? 1 : 2,
      breed: values.breed,
      age: parseInt(values.age),
      address: values.address,
      userId: searchedGroomer?._id,
    };

    if (linkVia === "mobile") {
      payload.phone = values.ownerContact.replace(/\D/g, "");
    } else {
      payload.email = values.ownerContact;
    }

    const { success, error } = await sendAcknowledgmentLink(payload);

    if (success) {
      toast.success("Acknowledgement link sent successfully!");
      reset();
      clearSearchedOwner();
      clearSearchedGroomer();
      await getAcknowledgments();
      onOpenChange(false);
      onSendLink?.();
    } else {
      toast.error(error || "Failed to send link");
    }
  };

  const handleAddToDashboard = async () => {
    if (!searchedOwner?.owner?._id) return;

    const { success, error } = await addToDashboard({
      ownerId: searchedOwner.owner._id,
      userId: searchedGroomer?._id || "",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-h-[min(100vh-2rem,900px)] max-h-[100vh] sm:min-w-[728px] min-w-[100vw] gap-0 overflow-hidden !px-0 !pt-14 sm:max-w-[560px] sm:rounded-[20px] rounded-none flex flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 size-10 shrink-0 cursor-pointer z-50"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.439584 19.3188C0.158123 19.6003 0 19.982 0 20.3801C0 20.7781 0.158123 21.1598 0.439584 21.4413C0.721045 21.7228 1.10279 21.8809 1.50083 21.8809C1.89888 21.8809 2.28062 21.7228 2.56208 21.4413L10.9396 13.0608L19.3186 21.4398C19.6015 21.713 19.9804 21.8642 20.3737 21.8608C20.767 21.8574 21.1432 21.6996 21.4213 21.4215C21.6994 21.1434 21.8572 20.7672 21.8606 20.3739C21.864 19.9806 21.7128 19.6017 21.4396 19.3188L13.0606 10.9398L21.4396 2.5608C21.7208 2.27934 21.8788 1.89768 21.8786 1.49977C21.8785 1.10187 21.7203 0.720315 21.4388 0.439053C21.1574 0.157791 20.7757 -0.000140554 20.3778 9.38613e-08C19.9799 0.000140742 19.5983 0.158343 19.3171 0.439804L10.9396 8.8188L2.56058 0.439804C2.27768 0.166567 1.89878 0.0153751 1.50548 0.0187927C1.11219 0.0222104 0.735968 0.179963 0.457856 0.458076C0.179744 0.736188 0.0219907 1.11241 0.018573 1.5057C0.0151554 1.899 0.166347 2.2779 0.439584 2.5608L8.81858 10.9398L0.439584 19.3188Z"
              fill="#657386"
            />
          </svg>
        </Button>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto premium-scrollbar sm:px-9 px-6 pt-0 pb-6">
            <div className="relative">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-[22px] font-[700] leading-[28px] text-[#111827] sm:text-[24px] sm:leading-[30px]">
                  Send Acknowledgement Link
                </DialogTitle>
                <DialogDescription className="text-[14px] leading-[20px] text-[#6B7280]">
                  Send a pet licensing request to the owner
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex flex-col gap-5 sm:mt-5 mt-4">
              {/* Card 1 — business */}
              <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-4">
                <div>
                  <label className="block pb-2.5 text-[14px] font-[500] text-[#14181F]">
                    Phone Number <span className="text-[#DC2828]">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex h-[52px] w-[54px] shrink-0 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-[#fff] text-[14px] sm:text-[16px] text-[#000]">
                      +1
                    </div>
                    <Input
                      type="tel"
                      placeholder="Phone Number"
                      className={cn(
                        "h-[52px] rounded-[12px] border-[#E5E7EB] text-[14px] placeholder:text-[#9CA3AF]",
                        errors.businessPhone && "border-[#DC2828]",
                      )}
                      value={watch("businessPhone")}
                      onChange={(e) =>
                        setValue(
                          "businessPhone",
                          formatPhoneNumber(e.target.value),
                          { shouldValidate: true },
                        )
                      }
                    />
                  </div>
                  {errors.businessPhone && (
                    <p className="mt-1 text-[12px] text-[#DC2828]">
                      {errors.businessPhone.message}
                    </p>
                  )}
                  <p className="mt-2 text-[12px] leading-4 text-[#6B7280]">
                    We&apos;ll use this to identify your business.
                  </p>
                </div>

                <div className="mt-5">
                  <label className="block pb-2.5 text-[14px] font-[500] text-[#14181F]">
                    Business Name <span className="text-[#DC2828]">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Business Name"
                      {...register("businessName")}
                      disabled={!!searchedGroomer}
                      className={cn(
                        "h-[52px] rounded-[12px] border-[#E5E7EB] text-[14px] text-[#000] disabled:opacity-100 disabled:text-[#000] placeholder:text-[#9CA3AF]",
                        errors.businessName && "border-[#DC2828]",
                      )}
                    />
                  </div>
                  {errors.businessName && (
                    <p className="mt-1 text-[12px] text-[#DC2828]">
                      {errors.businessName.message}
                    </p>
                  )}
                  {searchGroomerLoading && (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-3 w-3 animate-spin text-[#03838C]" />
                      <p className="text-[12px] text-[#6B7280]">Searching...</p>
                    </div>
                  )}
                  {!searchGroomerLoading && searchedGroomer === null && (
                    <p className="mt-2 text-[12px] leading-4 text-[#DC2828]">
                      No Business Found
                    </p>
                  )}
                  {!searchGroomerLoading && searchedGroomer && (
                    <p className="mt-2 text-[12px] leading-4 text-[#11C468]">
                      Business Found
                    </p>
                  )}
                </div>
              </div>

              {/* Card 2 — send via + owner */}
              <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-4">
                <div>
                  <p className="block pb-2.5 text-[14px] font-[500] text-[#14181F]">
                    Send Link via <span className="text-[#DC2828]">*</span>
                  </p>
                  <div className="grid grid-cols-2 gap-0 rounded-[12px] border border-[#E5E7EB] p-1">
                    <button
                      type="button"
                      className={cn(
                        "flex items-center justify-center cursor-pointer gap-2 rounded-[10px] px-3 py-3 text-[15px] font-[600] leading-5 transition-colors",
                        linkVia === "mobile"
                          ? "bg-[#03838C] text-white"
                          : "bg-transparent text-[#6B7F7C]",
                      )}
                      onClick={() => setLinkVia("mobile")}
                    >
                      <Phone
                        className="size-4 shrink-0"
                        strokeWidth={2}
                        aria-hidden
                      />
                      Mobile No.
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "flex items-center justify-center cursor-pointer gap-2 rounded-[10px] px-3 py-3 text-[15px] font-[600] leading-5 transition-colors",
                        linkVia === "email"
                          ? "bg-[#03838C] text-white"
                          : "bg-transparent text-[#6B7F7C]",
                      )}
                      onClick={() => setLinkVia("email")}
                    >
                      <Mail
                        className="size-4 shrink-0"
                        strokeWidth={2}
                        aria-hidden
                      />
                      Email
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block pb-2.5 text-[14px] font-[500] text-[#14181F]">
                    Owner Name <span className="text-[#DC2828]">*</span>
                  </label>
                  <Input
                    placeholder="Owner Name"
                    {...register("ownerName")}
                    className={cn(
                      "h-[52px] rounded-[12px] border-[#E5E7EB] text-[14px] placeholder:text-[#9CA3AF]",
                      errors.ownerName && "border-[#DC2828]",
                    )}
                  />
                  {errors.ownerName && (
                    <p className="mt-1 text-[12px] text-[#DC2828]">
                      {errors.ownerName.message}
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <label className="block pb-2.5 text-[14px] font-[500] text-[#14181F]">
                    {linkVia === "mobile"
                      ? "Owner's Phone Number"
                      : "Owner's Email"}{" "}
                    <span className="text-[#DC2828]">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {linkVia === "mobile" && (
                      <div className="flex h-[52px] w-[54px] shrink-0 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-[#fff] text-[14px] sm:text-[16px] text-[#000]">
                        +1
                      </div>
                    )}
                    <Input
                      type={linkVia === "mobile" ? "tel" : "email"}
                      placeholder={
                        linkVia === "mobile" ? "Phone Number" : "Email address"
                      }
                      className={cn(
                        "h-[52px] rounded-[12px] border-[#E5E7EB] text-[14px] placeholder:text-[#9CA3AF]",
                        errors.ownerContact && "border-[#DC2828]",
                      )}
                      value={watch("ownerContact")}
                      onChange={(e) => {
                        const val = e.target.value;
                        setValue(
                          "ownerContact",
                          linkVia === "mobile" ? formatPhoneNumber(val) : val,
                          { shouldValidate: true },
                        );
                      }}
                    />
                  </div>
                  {errors.ownerContact && (
                    <p className="mt-1 text-[12px] text-[#DC2828]">
                      {errors.ownerContact.message}
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
                  ownerContact && (
                    <>
                      {searchedOwner ? (
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

                {searchedOwner && (
                  <div className="mt-4 flex flex-col gap-4 rounded-[14px] border border-[rgba(3,131,140,0.18)] bg-[linear-gradient(100deg,rgba(13,140,122,0.04)_0%,rgba(13,140,122,0.02)_100%)] sm:p-[20px] p-3">
                    {/* Acknowledgement Completed Badge */}
                    {searchedOwner.lastAcknowledgment && (
                      <div className="flex self-start">
                        <div className="flex items-center gap-1.5 rounded-full bg-[#E6F3F2] px-3 py-1 text-[12px] font-[500] text-[#03838C] border border-[rgba(3,131,140,0.18)]">
                          <span>✓</span>
                          <span>
                            Acknowledgement Completed:{" "}
                            {format(
                              new Date(
                                searchedOwner.lastAcknowledgment.updatedAt,
                              ),
                              "MMM,dd yyyy",
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-row items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-[#03838C] text-[18px] font-[600] text-white uppercase">
                          {searchedOwner.owner?.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2) || "O"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[16px] font-[600] leading-5 text-[#1A2825]">
                            {searchedOwner.owner?.name || "N/A"}
                          </p>
                          <p className="mt-0.5 text-[14px] font-normal leading-5 text-[#6B7F7C]">
                            {searchedOwner.pets?.[0] ? (
                              <>
                                {searchedOwner.pets[0].name} ·{" "}
                                {searchedOwner.pets[0].sex === 1
                                  ? "Male"
                                  : "Female"}
                                , {searchedOwner.pets[0].breed?.[0]}
                              </>
                            ) : (
                              "No pets registered"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-[14px] font-[500] text-[#14181F]">
                        <Phone className="h-4 w-4 text-[#14181F]" />
                        {searchedOwner.owner?.phoneCode || "+1"}{" "}
                        {searchedOwner.owner?.phone || "N/A"}
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-4 mt-2">
                      <button
                        type="button"
                        disabled={isSubmittingAcknowledgement}
                        onClick={handleAddToDashboard}
                        className="sm:h-[48px] h-[40px] flex items-center gap-2 px-4 cursor-pointer rounded-[12px] bg-[#03838C] text-[14px] font-[600] text-white hover:bg-[#036873] disabled:opacity-50"
                      >
                        {isSubmittingAcknowledgement ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ArrowRight className="size-4" aria-hidden /> Add to
                            Dashboard
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={isSubmittingLink}
                        onClick={() => handleSubmit(onSubmit)()}
                        className="h-[48px] cursor-pointer flex items-center gap-2 sm:px-4 px-0 rounded-[12px] bg-transparent text-[14px] font-[600] text-[#6B7F7C] hover:bg-transparent disabled:opacity-50"
                      >
                        {isSubmittingLink ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                            >
                              <path
                                d="M2.52344 1.12207C2.7952 1.08955 3.07093 1.13675 3.31641 1.25781L12.4375 5.7334H12.4385C12.6746 5.85005 12.8737 6.03023 13.0127 6.25391C13.1518 6.47773 13.2256 6.73647 13.2256 7C13.2255 7.26334 13.1516 7.52143 13.0127 7.74512C12.8736 7.96889 12.6747 8.14993 12.4385 8.2666H12.4375L3.31641 12.7422C3.12177 12.8383 2.90749 12.8878 2.69043 12.8877C2.47168 12.8875 2.25524 12.8371 2.05957 12.7393C1.86394 12.6415 1.69395 12.499 1.5625 12.3242C1.43108 12.1494 1.34238 11.9465 1.30273 11.7314C1.26312 11.5164 1.27355 11.2951 1.34082 2.11035C1.421 1.84882 1.57529 1.6159 1.78516 1.44043C1.99507 1.26492 2.25176 1.15463 2.52344 1.12207ZM2.69336 2.2041C2.61485 2.20539 2.5392 2.23409 2.47949 2.28516C2.43204 2.32584 2.397 2.37896 2.37793 2.43848C2.35921 2.49697 2.35694 2.55942 2.37109 2.61914L3.46582 6.46191H7C7.14238 6.46204 7.2792 6.51943 7.37988 6.62012C7.48046 6.72088 7.53711 6.85761 7.53711 7C7.53705 7.14241 7.48055 7.27915 7.37988 7.37988C7.2792 7.48057 7.14238 7.53698 7 7.53711H3.46582L2.37109 11.3994C2.35849 11.4599 2.36316 11.5228 2.38379 11.5811C2.40478 11.6403 2.44215 11.6922 2.49121 11.7314C2.54036 11.7708 2.59962 11.7962 2.66211 11.8037C2.72449 11.8111 2.78781 11.801 2.84473 11.7744L11.9609 7.30371L12.0391 7.25098C12.0624 7.23002 12.0828 7.20557 12.0996 7.17871C12.1332 7.12508 12.1513 7.06327 12.1514 7C12.1514 6.9366 12.1333 6.87403 12.0996 6.82031C12.066 6.76674 12.0179 6.72389 11.9609 6.69629L2.84277 2.24219L2.8418 2.24121C2.79593 2.2177 2.74489 2.20501 2.69336 2.2041Z"
                                fill="#6B7F7C"
                                stroke="#6B7F7C"
                                strokeWidth="0.2"
                              />
                            </svg>{" "}
                            Send Link Anyways
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3 — pet details */}
              {!searchedOwner && (
                <div className="rounded-[16px] border border-[#E5E7EB] bg-[#fff] p-4">
                  <div className="mb-4">
                    <p className="block text-[14px] font-[500] text-[#14181F] pb-[10px]">
                      Pet Type <span className="text-[#EF4444]">*</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-[12px] border px-3 py-3 text-[16px] font-[500] leading-[20px] cursor-pointer",
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
                          <span className="absolute left-3 top-[3.4rem] -translate-y-1/2">
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
                                      isSelected &&
                                        "bg-[#04838C]/5 font-medium",
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
                                        setValue(
                                          "breed",
                                          [...currentBreeds, b],
                                          {
                                            shouldValidate: true,
                                          },
                                        );
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
                            {(petType === "Dog"
                              ? DOG_BREEDS
                              : CAT_BREEDS
                            ).filter((b) =>
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
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(
                          (yr) => (
                            <SelectItem key={yr} value={yr.toString()}>
                              {yr}
                            </SelectItem>
                          ),
                        )}
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

          <div className="flex flex-col-reverse gap-3 sm:flex-row mt-8 py-4 sm:px-8 px-4 pt-0">
            <Button
              type="button"
              variant="outline"
              className="h-[48px] cursor-pointer flex-1 rounded-[12px] border-[#E5E7EB] bg-white text-[14px] font-[600] text-[#111827] hover:bg-[#F9FAFB]"
              onClick={() => {
                onLoginInstead?.();
              }}
            >
              Login Instead
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingLink}
              className="h-[48px] cursor-pointer flex-1 rounded-[12px] bg-[#03838C] text-[14px] font-[600] text-white hover:bg-[#036873]"
            >
              {isSubmittingLink ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {searchedOwner ? (
                    <>
                      <Check className="h-4 w-4" />
                      Owner Found
                    </>
                  ) : (
                    <>
                      Send Link <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SendAcknowledgementLinkDialog;
