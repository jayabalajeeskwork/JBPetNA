"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useStore } from "@/stores/useStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { s3BaseUrl } from "@/utils/endpoints";

export default function FinishAcknowledgementPageClient() {
  const { token } = useParams();
  const router = useRouter();
  const { 
    acknowledgmentDetails, 
    getAcknowledgmentDetails, 
    uploadFile, 
    submitLicenseDetails,
    municipalities,
    fetchMunicipalities
  } = useStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [licenseCertificate, setLicenseCertificate] = useState("");
  const [licenseConfirmation, setLicenseConfirmation] = useState("");
  const [rabiesReport, setRabiesReport] = useState("");
  
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const certificateRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);
  const rabiesRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token && !acknowledgmentDetails) {
      getAcknowledgmentDetails(token as string);
    }
  }, [token, acknowledgmentDetails, getAcknowledgmentDetails]);

  useEffect(() => {
    if (municipalities.length === 0) {
      fetchMunicipalities(500);
    }
  }, [fetchMunicipalities, municipalities.length]);

  const handleFileUpload = async (file: File, type: string) => {
    setUploading(prev => ({ ...prev, [type]: true }));
    const res = await uploadFile(file);
    setUploading(prev => ({ ...prev, [type]: false }));

    if (res.success && res.url) {
      const fileName = res.url.split("/").pop();
      const s3Url = `${s3BaseUrl}/${fileName}`;
      if (type === "certificate") setLicenseCertificate(s3Url);
      if (type === "confirmation") setLicenseConfirmation(s3Url);
      if (type === "rabies") setRabiesReport(s3Url);
      toast.success("File uploaded successfully");
    } else {
      toast.error(res.error || "Upload failed");
    }
  };

  const onFileChange = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, type);
  };

  const handleSubmit = async () => {
    if (!licenseCertificate || !licenseConfirmation || !rabiesReport) {
      toast.error("Please upload all three required documents");
      return;
    }

    setIsSubmitting(true);
    const res = await submitLicenseDetails({
      acknowledgementId: acknowledgmentDetails?._id || acknowledgmentDetails?.id || "",
      licenseCertificate,
      licenseConfirmation,
      rabiesVaccinationReport: rabiesReport,
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Details submitted successfully!");
      router.push(`/acknowledgement/${token}?step=5`);
    } else {
      toast.error(res.error || "Failed to submit details");
    }
  };

  if (!acknowledgmentDetails) return null;

  const owner = acknowledgmentDetails.owner || {};
  const pet = acknowledgmentDetails.pet || {};
  const breedStr = Array.isArray(pet.breed) ? pet.breed.join(", ") : (pet.breed || "");

  const municipalityName = municipalities.find(m => m._id === owner.municipality || m.id === owner.municipality)?.name || owner.municipality || "N/A";
  return (
    <div className="relative min-h-screen bg-white flex flex-col">
      {/* Background blurs (reuse style from main acknowledgement page) */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 hidden sm:block">
        <Image src="/images/Background+Blur.svg" alt="Ggia" width={288} height={383} />
      </div>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 hidden sm:block">
        <Image src="/images/Background+Blur+2.svg" alt="Ggia" width={288} height={383} />
      </div>

      {/* Header */}
      <header className="border-b border-[#EEE]">
        <div className="py-4 px-4 sm:px-6 lg:px-8 w-full mx-auto flex items-center justify-between max-w-[1440px]">
          <Link href="/">
            <Image src="/images/logo.svg" alt="Ggia" width={59} height={32} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[#627084]">
            <a href="#secure" className="hover:text-[#03838C] transition-colors">
              Secure &amp; Private
            </a>
            <a href="#privacy" className="hover:text-[#03838C] transition-colors">
              Privacy Policy
            </a>
            <a href="#support" className="hover:text-[#03838C] transition-colors">
              Support
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12">
 
        <h1 className="text-[30px] sm:text-[40px] font-bold text-[#14181F] text-center leading-[40px] sm:leading-[52px]">
          Finish your acknowledgment
        </h1>
        <p className="text-[14px] sm:text-[18px] text-[#657386] sm:mt-[8px] mt-[10px] text-center">
          Upload proof of your municipal application/licensing in under 1 minute.
        </p>

        <Card className="w-full max-w-[720px] mt-[32px] border-0 sm:p-[28px] p-[18px] shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] rounded-[16px] bg-white">
          <CardHeader className="p-0 mb-4">
            <div className="flex flex-col gap-3">
              {/* Provider summary */}
              <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-3">
                <div className="flex items-center gap-[16px]">
                <div className="flex-shrink-0">
                  <Image src="/images/happy.svg" alt="info-icon" width={52} height={52} /></div>
                <div>
                <p className=" text-[16px] sm:text-[18px] font-[700] text-[#1A2825]">{acknowledgmentDetails.groomerId?.businessName || "Service Provider"}</p>
                  <p className="text-[14px] font-[400] text-[#6B7F7C]">Requested by this service provider</p>
               
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[12px] font-[500] text-[#657386] bg-[#EAEDF0] px-[10px] py-[5px] rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>~2 minutes</span>
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 ">
            {/* Your details */}
            <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-[20px]">
              <div className="flex items-center justify-between pb-[10px] ">
                <p className="text-[16px] font-[700] text-[#1A2825]">Your details</p>
                <button
                  type="button"
                  className="text-[14px] flex items-center gap-1.5 cursor-pointer font-[600] text-[#03838C] hover:text-[#036b73] underline-offset-2 hover:underline"
                >
              <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
  <path d="M4.76 18.8096H4.87L7.8 18.5396C8.21 18.4996 8.59 18.3196 8.88 18.0296L19.94 6.96961C20.46 6.44961 20.75 5.75961 20.75 5.02961C20.75 4.29961 20.46 3.60961 19.94 3.08961L19.23 2.37961C18.19 1.33961 16.38 1.33961 15.34 2.37961L13.93 3.78961L4.29 13.4296C4 13.7196 3.82 14.0996 3.79 14.5096L3.52 17.4396C3.49 17.8096 3.62 18.1696 3.88 18.4396C4.12 18.6796 4.43 18.8096 4.76 18.8096ZM17.29 3.06961C17.61 3.06961 17.93 3.18961 18.17 3.43961L18.88 4.14961C18.9968 4.26446 19.0896 4.40142 19.153 4.55251C19.2163 4.70359 19.2489 4.86578 19.2489 5.02961C19.2489 5.19344 19.2163 5.35562 19.153 5.50671C19.0896 5.6578 18.9968 5.79476 18.88 5.90961L18 6.78961L15.53 4.31961L16.41 3.43961C16.65 3.19961 16.97 3.06961 17.29 3.06961ZM5.28 14.6496C5.28 14.5896 5.31 14.5396 5.35 14.4996L14.46 5.37961L16.93 7.84961L7.82 16.9596C7.82 16.9596 7.72 17.0296 7.67 17.0296L5.04 17.2696L5.28 14.6396V14.6496ZM22.75 21.9996C22.75 22.4096 22.41 22.7496 22 22.7496H2C1.59 22.7496 1.25 22.4096 1.25 21.9996C1.25 21.5896 1.59 21.2496 2 21.2496H22C22.41 21.2496 22.75 21.5896 22.75 21.9996Z" fill="#03838C"/>
</svg></span>    Edit
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-[20px] border-t border-[#E5E7EB] sm:divide-x divide-[#E5E7EB]">
                <div className="pt-[20px] space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7F7C] pb-[10px]">
                    Owner information
                  </p>
                  <p className="text-[12px] font-normal text-[#6B7F7C]">Name</p>
                  <p className="text-[14px] font-[600] text-[#1A2825] pb-[10px]">{owner.name || "N/A"}</p>
                  <p className="mt-2 text-[12px] font-normal text-[#6B7F7C]">Email</p>
                  <p className="text-[14px] font-[600] text-[#1A2825] pb-[10px] break-all">{owner.email || "N/A"}</p>
                  <p className="mt-2 text-[12px] font-normal text-[#6B7F7C]">Phone</p>
                  <p className="text-[14px] font-[600] text-[#1A2825] ">{owner.phone || "N/A"}</p>
                </div>

                <div className="pt-[20px] space-y-1 sm:pl-[20px] pl-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7F7C] pb-[10px]">Pet information</p>
                  <p className="text-[12px] font-normal text-[#6B7F7C]">Name &amp; type</p>
                  <p className="text-[14px] font-[600] text-[#1A2825] pb-[10px]">{pet.name || "N/A"} ({pet.type === 1 ? "Dog" : "Cat"})</p>
                  <p className="mt-2 text-[12px] font-normal text-[#6B7F7C]">Breed</p>
                  <p className="text-[14px] font-[600] text-[#1A2825] pb-[10px]">{breedStr || "N/A"}</p>
                  <p className="mt-2 text-[12px] font-normal text-[#6B7F7C]">Age</p>
                  <p className="text-[14px] font-[600] text-[#1A2825] ">{pet.age ? `${pet.age} years old` : "N/A"}</p>
                </div>

                <div className="pt-[20px] space-y-1 sm:pl-[20px] pl-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7F7C] pb-[10px]">Residence</p>
                  <p className="text-[12px] font-normal text-[#6B7F7C]">City</p>
                  <p className="text-[14px] font-[600] text-[#1A2825] pb-[10px]">{municipalityName}</p>
                  <p className="mt-2 text-[12px] font-normal text-[#6B7F7C]">Address</p>
                  <p className="text-[14px] font-[600] text-[#1A2825] pb-[10px]">{pet.address || owner.address || "N/A"}</p>
                  <p className="mt-2 text-[12px] font-normal text-[#6B7F7C]">License status</p>
                  <p className="inline-flex items-center gap-1 text-[12px] font-[500] text-[#03838C] bg-[#E6F4F1] border border-[#03838c2e] rounded-full px-[10px] py-[4px]">
                    ✓ {acknowledgmentDetails.isFormCompleted ? "Completed" : "In Progress"}
                  </p>
                </div>
              </div>
            </section>

            {/* Upload proof section */}
            <section className="space-y-4 border border-[#E5E7EB] p-[20px] rounded-[18px] mt-[24px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[16px] font-[700] text-[#1A2825]">
                    Upload proof <span className="text-red-500">*</span>
                  </p>
                  <p className="text-[14px] font-[400] text-[#6B7F7C] mt-1">
                    Upload at least one of the following. Clicking upload will allow you to take a picture also.
                  </p>
                </div>
              </div>

              <div className="">
                {/* Item */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EAEDF0] bg-white mt-[20px] pb-[20px]">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Image src="/images/click1.svg" alt="Pet license" width={40} height={40} />
                    </div>
                    <div>
                      <p className="text-[14px] font-[600] text-[#1A2825]">Pet license certificate</p>
                      <p className="text-[12px] text-[#657386]">
                        From your municipality.
                      </p>
                    </div>
                  </div>
                  <input type="file" ref={certificateRef} className="hidden" onChange={onFileChange("certificate")} accept=".jpg,.jpeg,.png,.pdf" />
                  <Button
                    type="button"
                    onClick={() => certificateRef.current?.click()}
                    disabled={uploading["certificate"]}
                    className="w-full sm:w-auto h-[34px] rounded-[9px] bg-[#03838C] hover:bg-[#036b73] text-white text-[13px] font-semibold cursor-pointer"
                  >
                    {uploading["certificate"] ? <Loader2 className="h-4 w-4 animate-spin" /> : licenseCertificate ? <CheckCircle2 className="h-4 w-4" /> : <span><Image src="/images/upload0.svg" alt="upload" width={16} height={16} /></span>}
                    {uploading["certificate"] ? "Uploading..." : licenseCertificate ? "Uploaded" : "Click/Upload"}
                  </Button>
                </div>

                {/* Item */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E5E7EB] bg-white mt-[20px] pb-[20px]">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Image src="/images/click2.svg" alt="License application" width={40} height={40} />
                    </div>
                    <div>
                      <p className="text-[14px] font-[600] text-[#1A2825]">License application confirmation</p>
                      <p className="text-[12px] text-[#657386]">
                        Email confirmation or a picture of the completed application.
                      </p>
                    </div>
                  </div>
                  <input type="file" ref={confirmationRef} className="hidden" onChange={onFileChange("confirmation")} accept=".jpg,.jpeg,.png,.pdf" />
                  <Button
                    type="button"
                    onClick={() => confirmationRef.current?.click()}
                    disabled={uploading["confirmation"]}
                    className="w-full sm:w-auto h-[34px] rounded-[9px] bg-[#03838C] hover:bg-[#036b73] text-white text-[13px] font-semibold cursor-pointer"
                  >
                    {uploading["confirmation"] ? <Loader2 className="h-4 w-4 animate-spin" /> : licenseConfirmation ? <CheckCircle2 className="h-4 w-4" /> : <span><Image src="/images/upload0.svg" alt="upload" width={16} height={16} /></span>}
                    {uploading["confirmation"] ? "Uploading..." : licenseConfirmation ? "Uploaded" : "Click/Upload"}
                  </Button>
                </div>

                {/* Item */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white mt-[20px]">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Image src="/images/click3.svg" alt="Rabies certificate" width={40} height={40} />
                    </div>
                    <div>
                      <p className="text-[14px] font-[600] text-[#1A2825]">Rabies vaccination certificate</p>
                      <p className="text-[12px] text-[#657386]">
                        Or vaccination report.
                      </p>
                    </div>
                  </div>
                  <input type="file" ref={rabiesRef} className="hidden" onChange={onFileChange("rabies")} accept=".jpg,.jpeg,.png,.pdf" />
                  <Button
                    type="button"
                    onClick={() => rabiesRef.current?.click()}
                    disabled={uploading["rabies"]}
                    className="w-full sm:w-auto h-[34px] rounded-[9px] bg-[#03838C] hover:bg-[#036b73] text-white text-[13px] font-semibold cursor-pointer"
                  >
                    {uploading["rabies"] ? <Loader2 className="h-4 w-4 animate-spin" /> : rabiesReport ? <CheckCircle2 className="h-4 w-4" /> : <span><Image src="/images/upload0.svg" alt="upload" width={16} height={16} /></span>}
                    {uploading["rabies"] ? "Uploading..." : rabiesReport ? "Uploaded" : "Click/Upload"}
                  </Button>
                </div>
              </div>

           
            </section>
   {/* Quick tips */}
   <div className="rounded-[14px] border border-[rgba(3,131,140,0.18)] bg-[linear-gradient(100deg,rgba(13,140,122,0.04)_0%,rgba(13,140,122,0.02)_100%)] p-[14px] flex my-[24px] gap-[12px]">
                <div className="flex-shrink-0">
                  <Image src="/images/Background.svg" alt="Tips" width={32} height={32} />
                </div>
                <div>
                  <p className="text-[16px] font-[600] text-[#03838C]">Quick tips</p>
                  <p className="text-[12px] font-[400] text-[#657386] mt-1">
                  Take a clear photo;<span className="font-[600] text-[#171717]">include dates & municipality.</span>  only <span className="font-[600] text-[#171717]">photo and PDF </span>are accepted.
                  </p>
                </div>
              </div>
            {/* Bottom CTA */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !licenseCertificate || !licenseConfirmation || !rabiesReport}
                className="w-full h-[48px] rounded-[12px] bg-[#03838C] hover:bg-[#036b73] text-white font-semibold text-[14px] cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue <ArrowRight className=" w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-[14px] text-[#657386] sm:mt-[40px] mt-[20px] text-center">
          Need help? Contact support at{" "}
          <a href="mailto:support@ggia.com" className="text-[#14181F] font-medium underline block">
            support@ggia.com
          </a>
        </p>
      </main>
    </div>
  );
}

