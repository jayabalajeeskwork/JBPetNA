"use client";

import { ChangeEvent, DragEvent, ReactNode, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import PaymentTrustRow from "./PaymentTrustRow";
import { useStore } from "@/stores/useStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatPhoneNumber } from "@/utils/formatters";
import EditDetailsDialog from "./EditDetailsDialog";

type AcknowledgementInfoSheetProps = {
  trigger: ReactNode;
};

type FormErrors = {
  color?: string;
  vetName?: string;
  vetAddress?: string;
  vetPhone?: string;
  rabiesReport?: string;
};

const getFileNameFromUrl = (url: string) => {
  if (!url) return "";
  try {
    const decoded = decodeURIComponent(url);
    return decoded.substring(decoded.lastIndexOf("/") + 1);
  } catch (e) {
    return url.substring(url.lastIndexOf("/") + 1);
  }
};

const AcknowledgementInfoSheet = ({
  trigger,
}: AcknowledgementInfoSheetProps) => {
  const { 
    uploadFile, 
    acknowledgmentDetails, 
    submitLicenseDetails, 
    isSubmittingLicenseDetails,
    municipalities,
    fetchVeterinarians
  } = useStore();
  const [rabiesReportFile, setRabiesReportFile] = useState<File | null>(null);
  const [rabiesReportUrl, setRabiesReportUrl] = useState<string>(
    acknowledgmentDetails?.proofOfRabies || 
    acknowledgmentDetails?.rabiesVaccinationReport || 
    acknowledgmentDetails?.pet?.rabiesVaccinationReport || 
    ""
  );
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [submitLater, setSubmitLater] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editType, setEditType] = useState<"owner" | "pet" | "residence">("owner");

  // Form states for "through_ggia"
  const [color, setColor] = useState(acknowledgmentDetails?.pet?.color || "");
  const [hairLength, setHairLength] = useState(acknowledgmentDetails?.pet?.hairLength || "Short");
  const [spayedNeutered, setSpayedNeutered] = useState(acknowledgmentDetails?.pet?.isSpayedNeutered ?? true);
  const [vetName, setVetName] = useState(acknowledgmentDetails?.pet?.vetName || "");
  const [vetAddress, setVetAddress] = useState(acknowledgmentDetails?.pet?.vetAddress || "");
  const [vetPhone, setVetPhone] = useState(acknowledgmentDetails?.pet?.vetPhone || "");

  // Veterinarian search states
  const [vetSearchResults, setVetSearchResults] = useState<any[]>([]);
  const [isSearchingVets, setIsSearchingVets] = useState(false);
  const [showVetDropdown, setShowVetDropdown] = useState(false);
  const vetDropdownRef = useRef<HTMLDivElement>(null);

  // Error state
  const [errors, setErrors] = useState<FormErrors>({});

  // Veterinarian search effect with debounce
  useEffect(() => {
    if (!vetName || vetName.length < 2 || !showVetDropdown) {
      setVetSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingVets(true);
      const res = await fetchVeterinarians(vetName);
      setIsSearchingVets(false);
      if (res.success && res.data) {
        setVetSearchResults(res.data);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [vetName, fetchVeterinarians, showVetDropdown]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (vetDropdownRef.current && !vetDropdownRef.current.contains(event.target as Node)) {
        setShowVetDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync form states with acknowledgmentDetails updates
  useEffect(() => {
    if (acknowledgmentDetails?.pet) {
      const pet = acknowledgmentDetails.pet;
      if (pet.color) setColor(pet.color);
      if (pet.hairLength) setHairLength(pet.hairLength);
      
      const isSpayed = pet.isSpayedNeutered !== undefined 
        ? pet.isSpayedNeutered 
        : (pet.spayedNeutered !== undefined ? pet.spayedNeutered : true);
      setSpayedNeutered(isSpayed);
      
      if (pet.vetName) setVetName(pet.vetName);
      if (pet.vetAddress) setVetAddress(pet.vetAddress);
      if (pet.vetPhone) setVetPhone(pet.vetPhone);
    }
    
    const rabiesUrl = acknowledgmentDetails?.proofOfRabies || 
      acknowledgmentDetails?.rabiesVaccinationReport || 
      acknowledgmentDetails?.pet?.rabiesVaccinationReport || 
      "";
    if (rabiesUrl) {
      setRabiesReportUrl(rabiesUrl);
    }
  }, [acknowledgmentDetails]);

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!color) newErrors.color = "Pet color is required";
    if (!vetName || !vetName.trim()) newErrors.vetName = "Veterinarian name is required";
    // Veterinarian address and phone are now optional
    if (!submitLater && !rabiesReportUrl) newErrors.rabiesReport = "Please upload rabies report or select 'Submit later'";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!acknowledgmentDetails?._id && !acknowledgmentDetails?.id) {
      toast.error("Acknowledgement ID not found");
      return;
    }

    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Clean payload: don't send empty strings
    const payload = {
      acknowledgementId: acknowledgmentDetails._id || acknowledgmentDetails.id || "",
      licenseOption: "through_ggia",
      color,
      hairLength,
      spayedNeutered,
      vetName: vetName.trim() || undefined,
      vetAddress: vetAddress.trim() || undefined,
      vetPhone: vetPhone.trim() || undefined,
      rabiesVaccinationReport: rabiesReportUrl || undefined,
    };

    const res = await submitLicenseDetails(payload);
    if (res.success) {
      toast.success("License details submitted successfully!");
    } else {
      toast.error(res.error || "Submission failed");
    }
  };

  const rabiesReportInputRef = useRef<HTMLInputElement>(null);

  const handleRabiesReportChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (selectedFile) {
      setRabiesReportFile(selectedFile);
      setSubmitLater(false);
      setErrors(prev => ({ ...prev, rabiesReport: undefined }));

      setIsUploading(true);
      const res = await uploadFile(selectedFile);
      setIsUploading(false);

      if (res.success && res.url) {
        setRabiesReportUrl(res.url);
        toast.success("File uploaded successfully");
      } else {
        toast.error(res.error || "Upload failed");
      }
    }
  };

  const handleRabiesReportDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
    const selectedFile = event.dataTransfer.files?.[0] ?? null;
    if (selectedFile) {
      setRabiesReportFile(selectedFile);
      setSubmitLater(false);
      setErrors(prev => ({ ...prev, rabiesReport: undefined }));

      setIsUploading(true);
      const res = await uploadFile(selectedFile);
      setIsUploading(false);

      if (res.success && res.url) {
        setRabiesReportUrl(res.url);
        toast.success("File uploaded successfully");
      } else {
        toast.error(res.error || "Upload failed");
      }
    }
  };

  return (
    <>
      <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="max-w-[820px] p-0 flex flex-col overflow-hidden max-h-[100vh]">
        <div className="flex-1 overflow-y-auto premium-scrollbar px-4 py-6 pt-10">
          <SheetHeader className="mb-4 space-y-1 text-left">
            <SheetTitle className="text-[22px] font-semibold text-[#111827]">
              Confirmation Details
            </SheetTitle>
            <p className="text-[13px] text-[#6B7280]">
              Review & finalize your license
            </p>
          </SheetHeader>
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="absolute top-[20px] right-[20px] cursor-pointer rounded-[10px] p-[10px] hover:bg-[#F5F5F5]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
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
            </button>
          </SheetClose>
          {/* Progress summary */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="h-1.5 w-full rounded-full bg-[#E5E7EB]">
                <div className="h-1.5 w-1/2 rounded-full bg-[#03838C]" />
              </div>
            </div>
            <p className="whitespace-nowrap text-[14px] font-normal text-[#657386]">
              2 of 4 required fields are filled
            </p>
          </div>

          {/* Details card */}
          <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-[24px]">
            {/* Card header */}
            <div className="flex items-center justify-between ">
              <div>
                <p className="text-[16px] font-[700] text-[#1A2825]">
                  Review Your Details
                </p>
              </div>
              <button
                type="button"
                className="inline-flex  items-center cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M19.9201 8.94922L13.4001 15.4693C12.6301 16.2393 11.3701 16.2393 10.6001 15.4693L4.08008 8.94922"
                    stroke="#1A2825"
                    strokeWidth="2"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-[#DCE8E5] my-[24px]" />

            {/* Sections */}
            <div className="grid gap-6  md:grid-cols-3">
              {/* Owner Information */}
              <div className="border-r border-[#E5E7EB] pr-[24px]">
                <div className="flex items-center justify-between pb-[16px]">
                  <p className="text-[12px] font-[700] uppercase tracking-[0.08em] text-[#6B7F7C]">
                    Owner Information
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditType("owner");
                      setIsEditDialogOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 cursor-pointer text-[#03838C] text-[12px] font-[600]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path
                        d="M3.57 14.1067H3.6525L5.85 13.9042C6.1575 13.8742 6.4425 13.7392 6.66 13.5217L14.955 5.22672C15.345 4.83672 15.5625 4.31922 15.5625 3.77172C15.5625 3.22422 15.345 2.70672 14.955 2.31672L14.4225 1.78422C13.6425 1.00422 12.285 1.00422 11.505 1.78422L10.4475 2.84172L3.2175 10.0717C3 10.2892 2.865 10.5742 2.8425 10.8817L2.64 13.0792C2.6175 13.3567 2.715 13.6267 2.91 13.8292C3.09 14.0092 3.3225 14.1067 3.57 14.1067ZM12.9675 2.30172C13.2075 2.30172 13.4475 2.39172 13.6275 2.57922L14.16 3.11172C14.2476 3.19786 14.3172 3.30058 14.3647 3.41389C14.4122 3.52721 14.4367 3.64885 14.4367 3.77172C14.4367 3.89459 14.4122 4.01623 14.3647 4.12955C14.3172 4.24286 14.2476 4.34558 14.16 4.43172L13.5 5.09172L11.6475 3.23922L12.3075 2.57922C12.4875 2.39922 12.7275 2.30172 12.9675 2.30172ZM3.96 10.9867C3.96 10.9417 3.9825 10.9042 4.0125 10.8742L10.845 4.03422L12.6975 5.88672L5.865 12.7192C5.865 12.7192 5.79 12.7717 5.7525 12.7717L3.78 12.9517L3.96 10.9792V10.9867ZM17.0625 16.4992C17.0625 16.8067 16.8075 17.0617 16.5 17.0617H1.5C1.1925 17.0617 0.9375 16.8067 0.9375 16.4992C0.9375 16.1917 1.1925 15.9367 1.5 15.9367H16.5C16.8075 15.9367 17.0625 16.1917 17.0625 16.4992Z"
                        fill="#03838C"
                      />
                    </svg>
                    Edit
                  </button>
                </div>
                <div className="space-y-[12px]">
                  <div>
                    <p className="text-[12px] font-[400] text-[#6B7F7C]">
                      Name
                    </p>
                    <p className="text-[14px] font-medium text-[#1A2825]">
                      {acknowledgmentDetails?.owner?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-[400] text-[#6B7F7C]">
                      Email
                    </p>
                    <p className="text-[14px] font-medium text-[#1A2825]">
                      {acknowledgmentDetails?.owner?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-[400] text-[#6B7F7C]">
                      Phone
                    </p>
                    <p className="text-[14px] font-medium text-[#1A2825]">
                      {formatPhoneNumber(acknowledgmentDetails?.owner?.phone || "")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pet Information */}
              <div className="border-r border-[#E5E7EB] pr-[24px]">
                <div className="flex items-center justify-between pb-[16px]">
                  <p className="text-[12px] font-[700] uppercase tracking-[0.08em] text-[#6B7F7C]">
                    Pet Information
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditType("pet");
                      setIsEditDialogOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 cursor-pointer text-[#03838C] text-[12px] font-[600]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path
                        d="M3.57 14.1067H3.6525L5.85 13.9042C6.1575 13.8742 6.4425 13.7392 6.66 13.5217L14.955 5.22672C15.345 4.83672 15.5625 4.31922 15.5625 3.77172C15.5625 3.22422 15.345 2.70672 14.955 2.31672L14.4225 1.78422C13.6425 1.00422 12.285 1.00422 11.505 1.78422L10.4475 2.84172L3.2175 10.0717C3 10.2892 2.865 10.5742 2.8425 10.8817L2.64 13.0792C2.6175 13.3567 2.715 13.6267 2.91 13.8292C3.09 14.0092 3.3225 14.1067 3.57 14.1067ZM12.9675 2.30172C13.2075 2.30172 13.4475 2.39172 13.6275 2.57922L14.16 3.11172C14.2476 3.19786 14.3172 3.30058 14.3647 3.41389C14.4122 3.52721 14.4367 3.64885 14.4367 3.77172C14.4367 3.89459 14.4122 4.01623 14.3647 4.12955C14.3172 4.24286 14.2476 4.34558 14.16 4.43172L13.5 5.09172L11.6475 3.23922L12.3075 2.57922C12.4875 2.39922 12.7275 2.30172 12.9675 2.30172ZM3.96 10.9867C3.96 10.9417 3.9825 10.9042 4.0125 10.8742L10.845 4.03422L12.6975 5.88672L5.865 12.7192C5.865 12.7192 5.79 12.7717 5.7525 12.7717L3.78 12.9517L3.96 10.9792V10.9867ZM17.0625 16.4992C17.0625 16.8067 16.8075 17.0617 16.5 17.0617H1.5C1.1925 17.0617 0.9375 16.8067 0.9375 16.4992C0.9375 16.1917 1.1925 15.9367 1.5 15.9367H16.5C16.8075 15.9367 17.0625 16.1917 17.0625 16.4992Z"
                        fill="#03838C"
                      />
                    </svg>
                    Edit
                  </button>
                </div>
                <div className="space-y-[12px]">
                  <div>
                    <p className="text-[12px] font-[400] text-[#6B7F7C]">
                      Name &amp; type
                    </p>
                    <p className="text-[14px] font-medium text-[#1A2825]">
                      {acknowledgmentDetails?.pet?.name || "N/A"} ({acknowledgmentDetails?.pet?.petType === 2 ? "Cat" : "Dog"})
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-[400] text-[#6B7F7C]">
                      Sex &amp; Breed
                    </p>
                    <p className="text-[14px] font-medium text-[#1A2825]">
                      {acknowledgmentDetails?.pet?.sex || "N/A"}, {acknowledgmentDetails?.pet?.breed || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-[400] text-[#6B7F7C]">Age</p>
                    <p className="text-[14px] font-medium text-[#1A2825]">
                      {acknowledgmentDetails?.pet?.age ? `${acknowledgmentDetails.pet.age} years old` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Residence */}
              <div className="">
                <div className="flex items-center justify-between pb-[16px]">
                  <p className="text-[12px] font-[700] uppercase tracking-[0.08em] text-[#6B7F7C]">
                    Residence
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditType("residence");
                      setIsEditDialogOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 cursor-pointer text-[#03838C] text-[12px] font-[600]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path
                        d="M3.57 14.1067H3.6525L5.85 13.9042C6.1575 13.8742 6.4425 13.7392 6.66 13.5217L14.955 5.22672C15.345 4.83672 15.5625 4.31922 15.5625 3.77172C15.5625 3.22422 15.345 2.70672 14.955 2.31672L14.4225 1.78422C13.6425 1.00422 12.285 1.00422 11.505 1.78422L10.4475 2.84172L3.2175 10.0717C3 10.2892 2.865 10.5742 2.8425 10.8817L2.64 13.0792C2.6175 13.3567 2.715 13.6267 2.91 13.8292C3.09 14.0092 3.3225 14.1067 3.57 14.1067ZM12.9675 2.30172C13.2075 2.30172 13.4475 2.39172 13.6275 2.57922L14.16 3.11172C14.2476 3.19786 14.3172 3.30058 14.3647 3.41389C14.4122 3.52721 14.4367 3.64885 14.4367 3.77172C14.4367 3.89459 14.4122 4.01623 14.3647 4.12955C14.3172 4.24286 14.2476 4.34558 14.16 4.43172L13.5 5.09172L11.6475 3.23922L12.3075 2.57922C12.4875 2.39922 12.7275 2.30172 12.9675 2.30172ZM3.96 10.9867C3.96 10.9417 3.9825 10.9042 4.0125 10.8742L10.845 4.03422L12.6975 5.88672L5.865 12.7192C5.865 12.7192 5.79 12.7717 5.7525 12.7717L3.78 12.9517L3.96 10.9792V10.9867ZM17.0625 16.4992C17.0625 16.8067 16.8075 17.0617 16.5 17.0617H1.5C1.1925 17.0617 0.9375 16.8067 0.9375 16.4992C0.9375 16.1917 1.1925 15.9367 1.5 15.9367H16.5C16.8075 15.9367 17.0625 16.1917 17.0625 16.4992Z"
                        fill="#03838C"
                      />
                    </svg>
                    Edit
                  </button>
                </div>
                <div className="space-y-[12px]">
                  <div>
                    <p className="text-[12px] font-[400] text-[#6B7F7C]">
                      Municipality
                    </p>
                    <p className="text-[14px] font-medium text-[#1A2825]">
                      {municipalities.find(m => m._id === acknowledgmentDetails?.owner?.municipality || m.id === acknowledgmentDetails?.owner?.municipality)?.name || acknowledgmentDetails?.owner?.municipality || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-[400] text-[#6B7F7C]">
                      City
                    </p>
                    <p className="text-[14px] font-medium text-[#1A2825]">
                      {acknowledgmentDetails?.owner?.city || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-[400] text-[#6B7F7C]">
                      Address
                    </p>
                    <p className="text-[14px] font-medium text-[#1A2825]">
                      {acknowledgmentDetails?.pet?.address || acknowledgmentDetails?.owner?.address || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Finish License Details */}
          <div className="mt-[16px] rounded-[18px] border border-[#E5E7EB] bg-white p-[24px]">
            <p className="text-[16px] font-[700] leading-[24px] text-[#1A2825]">
              Finish License Details
            </p>
            <div className="my-[18px] h-px w-full bg-[#DCE8E5]" />

            <div className="grid gap-[24px] md:grid-cols-2">
              <div className="">
                <p className="text-[14px] font-medium text-[#14181F] block pb-[10px]">
                  Color <span className="text-[#DC2828]">*</span>
                </p>
                <Select 
                  value={color} 
                  onValueChange={(val) => {
                    setColor(val);
                    if (val) setErrors(prev => ({ ...prev, color: undefined }));
                  }}
                >
                  <SelectTrigger className={cn(
                    "h-[50px] rounded-[12px] w-full border bg-[#fff] px-[20px] text-[14px] shadow-none font-[400] transition-all duration-300 focus:ring-0",
                    errors.color ? "border-[#DC2828]" : "border-[#E5E7EB] text-[#111827]"
                  )}>
                    <SelectValue placeholder="Select Color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brown">Brown</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="golden">Golden</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.color && (
                  <p className="mt-1 text-[12px] text-[#DC2828]">{errors.color}</p>
                )}
              </div>

              <div className="">
                <p className="text-[14px] font-medium text-[#14181F] block pb-[10px]">
                  Hair Length <span className="text-[#DC2828]">*</span>
                </p>
                <div className="grid grid-cols-3 gap-[12px]">
                  <Button
                    type="button"
                    onClick={() => setHairLength("Short")}
                    variant={hairLength === "Short" ? "default" : "outline"}
                    className={cn(
                      "h-[50px] rounded-[12px] text-[16px] font-[500] cursor-pointer",
                      hairLength === "Short" ? "bg-[#03838C] hover:bg-[#036b73] text-white" : "border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FAFA]"
                    )}
                  >
                    Short
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setHairLength("Medium")}
                    variant={hairLength === "Medium" ? "default" : "outline"}
                    className={cn(
                      "h-[50px] rounded-[12px] text-[16px] font-[500] cursor-pointer",
                      hairLength === "Medium" ? "bg-[#03838C] hover:bg-[#036b73] text-white" : "border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FAFA]"
                    )}
                  >
                    Medium
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setHairLength("Long")}
                    variant={hairLength === "Long" ? "default" : "outline"}
                    className={cn(
                      "h-[50px] rounded-[12px] text-[16px] font-[500] cursor-pointer",
                      hairLength === "Long" ? "bg-[#03838C] hover:bg-[#036b73] text-white" : "border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FAFA]"
                    )}
                  >
                    Long
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-[24px] flex items-center justify-between">
              <div>
                <p className="text-[14px] font-[500] leading-[24px] text-[#14181F]">
                  Is your pet spayed or neutered?{" "}
                  <span className="text-[#DC2828]">*</span>
                </p>
                <p className="text-[12px] font-[400] leading-[16px] text-[#6B7280]">
                  *Affects license fee calculation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSpayedNeutered(!spayedNeutered)}
                aria-label="Pet spayed or neutered"
                className={cn(
                  "relative inline-flex h-[26px] w-[54px] items-center rounded-full p-[4px] cursor-pointer transition-colors",
                  spayedNeutered ? "bg-[#03838C]" : "bg-[#E5E7EB]"
                )}
              >
                <span className={cn(
                  "h-[18px] w-[18px] rounded-full bg-white transition-transform duration-200",
                  spayedNeutered ? "translate-x-[28px]" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>

          {/* Veterinarian Information */}
          <div className="mt-[16px] rounded-[18px] border border-[#E5E7EB] bg-[#fff] p-[24px]">
            <p className="text-[16px] font-[700] leading-[24px] text-[#1A2825]">
              Veterinarian Information
            </p>
            <div className="my-[18px] h-px w-full bg-[#DCE8E5]" />

            <div className="relative" ref={vetDropdownRef}>
              <p className="mb-[10px] text-[14px] font-medium text-[#14181F]">
                Veterinarian Name <span className="text-[#DC2828]">*</span>
              </p>
              <div className={cn(
                "flex h-[50px] text-[14px] font-[400] w-full items-center gap-2 rounded-[14px] border bg-white px-[12px]",
                errors.vetName ? "border-[#DC2828]" : "border-[#E5E7EB] text-[#111827]"
              )}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
                    stroke={errors.vetName ? "#DC2828" : "#111827"}
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.4995 17.4995L13.917 13.917"
                    stroke={errors.vetName ? "#DC2828" : "#111827"}
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <input
                  type="text"
                  value={vetName}
                  onChange={(e) => {
                    setVetName(e.target.value);
                    setShowVetDropdown(true);
                    if (e.target.value.trim()) setErrors(prev => ({ ...prev, vetName: undefined }));
                  }}
                  onFocus={() => vetName.length >= 2 && setShowVetDropdown(true)}
                  placeholder="Search for your Veterinarian"
                  className="w-full border-0 bg-transparent text-[16px] font-normal text-[#111827] outline-none placeholder:text-[#6B7280] "
                />
                {isSearchingVets && <Loader2 className="h-4 w-4 animate-spin text-[#03838C]" />}
              </div>
              
              {/* Veterinarian Dropdown */}
              {showVetDropdown && vetSearchResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-[12px] border border-[#E5E7EB] bg-white shadow-lg max-h-[250px] overflow-y-auto premium-scrollbar">
                  {vetSearchResults.map((vet) => (
                    <div
                      key={vet._id}
                      className="cursor-pointer px-[16px] py-[12px] hover:bg-[#F8FAFA] transition-colors border-b last:border-0 border-[#F5F5F5]"
                      onClick={() => {
                        setVetName(vet.fullName || "");
                        setVetAddress(`${vet.city || ""}, ${vet.state || ""}`);
                        // Phone is not provided in the API example, leaving it blank or keeping current value
                        setShowVetDropdown(false);
                        setErrors(prev => ({ 
                          ...prev, 
                          vetName: undefined, 
                          vetAddress: undefined,
                          vetPhone: undefined
                        }));
                      }}
                    >
                      <p className="text-[14px] font-[600] text-[#1A2825]">{vet.fullName}</p>
                      <p className="text-[12px] text-[#6B7280] truncate">{vet.city}, {vet.state}</p>
                    </div>
                  ))}
                </div>
              )}

              {errors.vetName && (
                <p className="mt-1 text-[12px] text-[#DC2828]">{errors.vetName}</p>
              )}
            </div>

            <div className="mt-[24px] grid gap-[24px] md:grid-cols-2">
              <div>
                <input
                  type="text"
                  value={vetAddress}
                  onChange={(e) => {
                    setVetAddress(e.target.value);
                    if (e.target.value.trim()) setErrors(prev => ({ ...prev, vetAddress: undefined }));
                  }}
                  placeholder="Veterinarian Address"
                  className={cn(
                    "h-[50px] w-full rounded-[12px] border bg-white px-[16px] text-[16px] font-normal outline-none placeholder:text-[#6B7280]",
                    errors.vetAddress ? "border-[#DC2828] text-[#DC2828]" : "border-[#E5E7EB] text-[#111827]"
                  )}
                />
                {errors.vetAddress ? (
                  <p className="mt-1 text-[12px] text-[#DC2828]">{errors.vetAddress}</p>
                ) : (
                  <p className="mt-[2px] text-[12px] font-normal text-[#6B7280]">
                    Auto-filled when you select a veterinarian
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={vetPhone}
                  onChange={(e) => {
                    setVetPhone(e.target.value);
                    if (e.target.value.trim()) setErrors(prev => ({ ...prev, vetPhone: undefined }));
                  }}
                  placeholder="Veterinarian Phone No."
                  className={cn(
                    "h-[50px] w-full rounded-[12px] border bg-white px-[16px] text-[16px] font-normal outline-none placeholder:text-[#6B7280]",
                    errors.vetPhone ? "border-[#DC2828] text-[#DC2828]" : "border-[#E5E7EB] text-[#111827]"
                  )}
                />
                {errors.vetPhone ? (
                  <p className="mt-1 text-[12px] text-[#DC2828]">{errors.vetPhone}</p>
                ) : (
                  <p className="mt-[2px] text-[12px] font-normal text-[#6B7280]">
                    Auto-filled when you select a veterinarian
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Rabies Vaccination Report */}
          <div className="mt-[16px] rounded-[18px] border border-[#D5DBE3] bg-[#fff] p-[24px]">
            <p className="mb-[12px] text-[16px] font-[700] leading-[24px] text-[#212B2A]">
              Rabies Vaccination Report
            </p>
            <div className="mb-[24px] h-px w-full bg-[#DCE8E5]" />

            <input
              ref={rabiesReportInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleRabiesReportChange}
              className="sr-only"
              id="rabies-vaccination-report-upload"
              disabled={isUploading}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => !isUploading && rabiesReportInputRef.current?.click()}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && !isUploading) {
                  event.preventDefault();
                  rabiesReportInputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (!isUploading) {
                  setIsDraggingFile(true);
                }
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                if (isUploading) {
                  e.preventDefault();
                  return;
                }
                handleRabiesReportDrop(e);
              }}
              className={cn(
                "flex min-h-[172px] w-full cursor-pointer flex-col items-center justify-center rounded-[20px] border-1 border-dashed p-[24px] text-center transition-colors",
                errors.rabiesReport ? "border-[#DC2828] bg-[#DC2828]/5" : (isDraggingFile || rabiesReportFile || rabiesReportUrl ? "border-[#03838C] bg-[#03838C]/5" : "border-[#D5DBE3] hover:border-[#03838C]/45"),
                isUploading && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 26 26"
                fill="none"
              >
                <path
                  d="M23.834 14.084C23.5467 14.084 23.2711 14.1981 23.0679 14.4013C22.8648 14.6044 22.7506 14.88 22.7506 15.1673V19.7314C22.7498 20.5319 22.4314 21.2993 21.8654 21.8654C21.2993 22.4314 20.5319 22.7498 19.7314 22.7507H6.2699C5.46941 22.7498 4.70195 22.4314 4.13592 21.8654C3.56989 21.2993 3.25151 20.5319 3.25065 19.7314V15.1673C3.25065 14.88 3.13651 14.6044 2.93335 14.4013C2.73019 14.1981 2.45464 14.084 2.16732 14.084C1.88 14.084 1.60445 14.1981 1.40129 14.4013C1.19812 14.6044 1.08398 14.88 1.08398 15.1673V19.7314C1.08542 21.1064 1.63225 22.4246 2.60449 23.3968C3.57673 24.3691 4.89495 24.9159 6.2699 24.9173H19.7314C21.1063 24.9159 22.4246 24.3691 23.3968 23.3968C24.3691 22.4246 24.9159 21.1064 24.9173 19.7314V15.1673C24.9173 14.88 24.8032 14.6044 24.6 14.4013C24.3969 14.1981 24.1213 14.084 23.834 14.084Z"
                  fill={errors.rabiesReport ? "#DC2828" : "#03838C"}
                />
                <path
                  d="M7.2666 9.433L11.9174 4.78225V18.4171C11.9174 18.7044 12.0315 18.98 12.2347 19.1831C12.4378 19.3863 12.7134 19.5004 13.0007 19.5004C13.288 19.5004 13.5636 19.3863 13.7667 19.1831C13.9699 18.98 14.084 18.7044 14.084 18.4171V4.78225L18.7348 9.433C18.9391 9.63034 19.2127 9.73953 19.4968 9.73707C19.7808 9.7346 20.0525 9.62067 20.2534 9.41981C20.4543 9.21895 20.5682 8.94723 20.5707 8.66319C20.5731 8.37914 20.4639 8.10549 20.2666 7.90117L13.7666 1.40117C13.5634 1.19808 13.2879 1.08398 13.0007 1.08398C12.7134 1.08398 12.4379 1.19808 12.2348 1.40117L5.73477 7.90117C5.53743 8.10549 5.42824 8.37914 5.43071 8.66319C5.43317 8.94723 5.54711 9.21895 5.74797 9.41981C5.94882 9.62067 6.22054 9.7346 6.50458 9.73707C6.78863 9.73953 7.06228 9.63034 7.2666 9.433Z"
                  fill={errors.rabiesReport ? "#DC2828" : "#03838C"}
                />
              </svg>
              <p className={cn(
                "mt-[12px] text-[16px] font-[700] leading-[24px] flex items-center gap-2",
                errors.rabiesReport ? "text-[#DC2828]" : "text-[#657386]"
              )}>
                {isUploading && (
                  <Loader2 className="h-4 w-4 animate-spin text-[#03838C]" />
                )}
                {isUploading
                  ? "Uploading..."
                  : rabiesReportFile
                    ? rabiesReportFile.name
                    : rabiesReportUrl
                      ? getFileNameFromUrl(rabiesReportUrl)
                      : (errors.rabiesReport || "Drop file here or click to browse")}
              </p>
              <p className="mt-[2px] text-[12px] font-normal leading-[18px] text-[#657386]">
                You can upload JPG, PNG, PDF (up to 8 MB)
              </p>
            </div>

            <label className="mt-[14px] inline-flex cursor-pointer items-center gap-[10px] text-[14px] font-normal text-[#657386]">
              <input
                type="checkbox"
                checked={submitLater}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setSubmitLater(checked);
                  if (checked) {
                    setRabiesReportFile(null);
                    setErrors(prev => ({ ...prev, rabiesReport: undefined }));
                  }
                }}
                className="!h-[20px] !w-[20px] cursor-pointer !rounded-[8px] border !border-[#657386] accent-[#03838C]"
              />
              <span>I don&apos;t have it yet (you can submit later)</span>
            </label>
          </div>
          {/* Fee Breakdown */}
          <div className="mt-[16px] bg-white">
            <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB]">
              <div className="px-[24px] py-[20px] pb-0">
                <p className="text-[16px] font-[700] leading-[24px] text-[#1A2825]">
                  Fee Breakdown
                </p>
              </div>

              <div className=" px-[24px] py-[16px]">
                <div className="flex items-center justify-between gap-[16px]">
                  <div>
                    <p className="text-[14px] font-[600] leading-[24px] text-[#1A2825]">
                      Municipal License Fee
                    </p>
                    <p className=" text-[12px] font-[500] leading-[16px] text-[#6B7280]">
                      West Orange, NJ · Spayed/Neutered Dog
                    </p>
                  </div>
                  <p className="text-[16px] font-[600] leading-[24px] text-[#1A2825]">
                    $15.00
                  </p>
                </div>
              </div>

              <div className="border-t border-[#E5E7EB] px-[24px] py-[16px]">
                <div className="flex items-center justify-between gap-[16px]">
                  <div>
                    <p className="text-[14px] font-[600] leading-[24px] text-[#1A2825]">
                      Ggia Service Fee
                    </p>
                    <p className="mt-[px] text-[12px] font-[500] leading-[16px] text-[#6B7280]">
                      Processing &amp; submission
                    </p>
                  </div>
                  <p className="text-[14px] font-[600] leading-[24px] text-[#111827]">
                    $4.00
                  </p>
                </div>
              </div>

              <div className="border-t border-[#DCE8E5] bg-[#03838c0d] px-[24px] py-[16px]">
                <div className="flex items-center justify-between gap-[16px]">
                  <p className="text-[16px] font-[700] leading-[24px] text-[#111827]">
                    Total Due Today
                  </p>
                  <p className="text-[18px] font-[700] leading-[24px] text-[#111827]">
                    $19.00
                  </p>
                </div>
              </div>
            </div>
          </div>

          <PaymentTrustRow 
            onClick={handleSubmit}
            disabled={isSubmittingLicenseDetails || isUploading}
            isLoading={isSubmittingLicenseDetails}
          />
        </div>
      </SheetContent>
    </Sheet>
    <EditDetailsDialog 
        isOpen={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        type={editType} 
        data={acknowledgmentDetails} 
      />
    </>
  );
};

export default AcknowledgementInfoSheet;
