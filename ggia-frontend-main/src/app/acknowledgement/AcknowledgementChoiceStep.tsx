import { ChangeEvent, DragEvent, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft, ArrowRight, CameraIcon, FileIcon, X, Check } from "lucide-react";
import MunicipalitySiteDialog from "./MunicipalitySiteDialog";
import Image from "next/image";
import AcknowledgementInfoSheet from "./AcknowledgementInfoSheet";
import { useStore } from "@/stores/useStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { s3BaseUrl } from "@/utils/endpoints";

type AcknowledgementChoiceStepProps = {
  token: string;
  onBack: () => void;
  onContinue: () => void;
};

const optionBase =
  "w-full text-left border rounded-[16px] px-4 py-4 flex gap-3 items-start cursor-pointer transition-colors";

const radioBase =
  "mt-1 h-4 w-4 rounded-full border border-[#C9D5E0] flex items-center justify-center shrink-0";

const AcknowledgementChoiceStep = ({
  token,
  onBack,
  onContinue,
}: AcknowledgementChoiceStepProps) => {
  const router = useRouter();
  const [selection, setSelection] = useState<
    "have-license" | "need-license" | null
  >(null);
  const [acknowledgementId, setAcknowledgementId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rabiesFile, setRabiesFile] = useState<File | null>(null);
  const [tagFile, setTagFile] = useState<File | null>(null);
  const [activeDropzone, setActiveDropzone] = useState<"rabies" | "tag" | null>(
    null,
  );
  const {
    uploadFile,
    getAcknowledgmentDetails,
    submitAcknowledgment,
    acknowledgmentDetails,
    updateLicenseOption,
    municipalities,
  } = useStore();
  const [rabiesUrl, setRabiesUrl] = useState("");
  const [tagUrl, setTagUrl] = useState("");
  const [isRabiesUploading, setIsRabiesUploading] = useState(false);
  const [isTagUploading, setIsTagUploading] = useState(false);

  const rabiesInputRef = useRef<HTMLInputElement | null>(null);
  const tagInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<"rabies" | "tag" | null>(
    null,
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const startCamera = async (target: "rabies" | "tag") => {
    setCameraTarget(target);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCameraTarget(null);
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Fetch initial data if not present
  useEffect(() => {
    if (token && !acknowledgmentDetails) {
      getAcknowledgmentDetails(token);
    }
  }, [token, getAcknowledgmentDetails, acknowledgmentDetails]);

  // Pre-fill from state
  useEffect(() => {
    if (acknowledgmentDetails) {
      const data = acknowledgmentDetails;
      setAcknowledgementId(data._id || data.id || "");

      // Prefill from API if data exists
      if (data.isLicenseFilled) {
        setSelection(data.isLicense ? "have-license" : "need-license");
      }
      
      // Prefill URLs if present in details
      if (data.proofOfRabies) {
        setRabiesUrl(data.proofOfRabies);
      }
      if (data.tagPicture) {
        setTagUrl(data.tagPicture);
      }
    }
  }, [acknowledgmentDetails]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraTarget) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
        );

        canvasRef.current.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `photo_${Date.now()}.jpg`, {
                type: "image/jpeg",
              });
              handleFileProcess(file, cameraTarget);
              stopCamera();
            }
          },
          "image/jpeg",
          0.9,
        );
      }
    }
  };

  const handleContinue = async () => {
    if (!selection) return;

    setIsSubmitting(true);
    let payload: any = {
      type: 3, // acknowledgmentType.LICENSE
      acknowledgementId: acknowledgementId || undefined,
    };

    if (selection === "have-license") {
      // Also update the license option in DB to ensure it's synced
      const resOpt = await updateLicenseOption({
        acknowledgementId: acknowledgementId,
        licenseOption: "license_exists",
      });
      if (resOpt.success && token) {
        await getAcknowledgmentDetails(token);
      }

      if (!rabiesUrl || !tagUrl) {
        toast.error("Please upload both rabies proof and tag picture.");
        setIsSubmitting(false);
        return;
      }
      payload.isLicense = true;
      payload.proofOfRabies = rabiesUrl;
      payload.tagPicture = tagUrl;
    } else {
      payload.isLicense = false;
    }

    const res = await submitAcknowledgment(payload);
    setIsSubmitting(false);

    if (res.success) {
      if (token) await getAcknowledgmentDetails(token);
      toast.success("License details submitted successfully!");
      onContinue();
    } else {
      toast.error(res.error || "Failed to submit details");
    }
  };

  const handleMunicipalityOption = async () => {
    if (acknowledgementId) {
      const res = await updateLicenseOption({
        acknowledgementId,
        licenseOption: "municipality_site",
      });
      if (res.success && token) {
        await getAcknowledgmentDetails(token);
      }
    }
  };

  const municipalityName =
    municipalities.find(
      (m) =>
        m._id === acknowledgmentDetails?.owner?.municipality ||
        m.id === acknowledgmentDetails?.owner?.municipality,
    )?.name || "your municipality";

  const handleFileProcess = async (file: File, type: "rabies" | "tag") => {
    if (type === "rabies") {
      setRabiesFile(file);
      setIsRabiesUploading(true);
      const res = await uploadFile(file);
      setIsRabiesUploading(false);
      if (res.success && res.url) {
        const fileName = res.url.split("/").pop();
        setRabiesUrl(`${s3BaseUrl}/${fileName}`);
        toast.success("Rabies proof uploaded");
      } else {
        toast.error(res.error || "Rabies upload failed");
      }
    } else {
      setTagFile(file);
      setIsTagUploading(true);
      const res = await uploadFile(file);
      setIsTagUploading(false);
      if (res.success && res.url) {
        const fileName = res.url.split("/").pop();
        setTagUrl(`${s3BaseUrl}/${fileName}`);
        toast.success("Tag picture uploaded");
      } else {
        toast.error(res.error || "Tag upload failed");
      }
    }
  };

  const handleFileChange =
    (type: "rabies" | "tag") => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (
        !["image/jpeg", "image/png", "application/pdf"].includes(file.type) ||
        file.size > 8 * 1024 * 1024
      )
        return;
      handleFileProcess(file, type);
    };

  const handleDrop =
    (type: "rabies" | "tag") => (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setActiveDropzone(null);
      const file = event.dataTransfer.files?.[0];
      if (!file) return;
      if (
        !["image/jpeg", "image/png", "application/pdf"].includes(file.type) ||
        file.size > 8 * 1024 * 1024
      )
        return;
      handleFileProcess(file, type);
    };

  return (
    <>
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-white rounded-[16px] p-4 max-w-md w-full mx-auto flex flex-col items-center shadow-lg">
            <div className="flex justify-between items-center w-full mb-4">
              <h3 className="text-[18px] font-bold text-[#14181F]">
                Take a Photo
              </h3>
              <Button variant="ghost" size="icon" onClick={stopCamera}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="relative w-full aspect-square sm:aspect-video bg-black rounded-[8px] overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <Button
              onClick={capturePhoto}
              className="w-full h-[46px] rounded-[12px] bg-[#03838C] text-white hover:bg-[#036b73] font-semibold text-[16px]"
            >
              <CameraIcon className="w-5 h-5 mr-2" />
              Capture
            </Button>
          </div>
        </div>
      )}

      <Card className="w-full max-w-[640px] gap-0 mt-[32px] border-0 sm:p-[38px] p-[18px] shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] rounded-[16px] bg-[#fff0] overflow-hidden">
        <CardHeader className="p-0 mb-0">
          <AcknowledgementInfoSheet
            trigger={
              <button
                type="button"
                className="sm:text-[22px] text-[18px] font-[700] text-[#171717] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#03838C] rounded"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                Choose Your Acknowledgement
              </button>
            }
          />
        </CardHeader>
        <CardContent className="p-0 space-y-[24px] mt-[10px]">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelection("have-license")}
            onKeyDown={(event) =>
              event.key === "Enter" && setSelection("have-license")
            }
            className={`${optionBase} flex-col ${
              selection === "have-license"
                ? "border-[#03838C] bg-[#fff]"
                : "border-[#E5E7EB] bg-white"
            }`}
          >
            <div className="flex items-start gap-[18px] w-full">
              <div className="flex-shrink-0">
                <Image
                  src="/images/Background+Border.svg"
                  alt="info"
                  width={52}
                  height={52}
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[16px] font-[700] text-[#1A2825]">
                  I have a license
                </p>
                <p className="text-[14px] text-[#6B7F7C] leading-[24px] tracking-[-0.5px]">
                  I&apos;m aware of the applicable municipal pet licensing
                  ordinance and confirm this pet is currently licensed or an
                  application has been submitted. I understand proof of
                  licensing may be required upon request.
                </p>
              </div>
              <div className={radioBase}>
                {selection === "have-license" && (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#03838C]" />
                )}
              </div>
            </div>

            {selection === "have-license" && (
              <div className="mt-4 w-full space-y-4 ">
                <div className="">
                  <p className="text-[13px] font-semibold text-[#14181F]">
                    Proof of rabies vaccination or exemption
                    <span className="text-[#EF4444]">*</span>
                  </p>
                </div>

                <input
                  ref={rabiesInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileChange("rabies")}
                />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => rabiesInputRef.current?.click()}
                  onKeyDown={(event) =>
                    event.key === "Enter" && rabiesInputRef.current?.click()
                  }
                  onDragOver={(event) => {
                    event.preventDefault();
                    setActiveDropzone("rabies");
                  }}
                  onDragLeave={() => setActiveDropzone(null)}
                  onDrop={handleDrop("rabies")}
                  className={`border-2 border-dashed rounded-[20px] sm:p-6 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                    activeDropzone === "rabies" || rabiesFile || rabiesUrl
                      ? "border-[#03838C] bg-[#03838C]/5"
                      : "border-[#E5E7EB] hover:border-[#03838C]/50"
                  }`}
                >
                  {rabiesFile || rabiesUrl ? (
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
                        fill="#03838C"
                      />
                      <path
                        d="M7.2666 9.433L11.9174 4.78225V18.4171C11.9174 18.7044 12.0315 18.98 12.2347 19.1831C12.4378 19.3863 12.7134 19.5004 13.0007 19.5004C13.288 19.5004 13.5636 19.3863 13.7667 19.1831C13.9699 18.98 14.084 18.7044 14.084 18.4171V4.78225L18.7348 9.433C18.9391 9.63034 19.2127 9.73953 19.4968 9.73707C19.7808 9.7346 20.0525 9.62067 20.2534 9.41981C20.4543 9.21895 20.5682 8.94723 20.5707 8.66319C20.5731 8.37914 20.4639 8.10549 20.2666 7.90117L13.7666 1.40117C13.5634 1.19808 13.2879 1.08398 13.0007 1.08398C12.7134 1.08398 12.4379 1.19808 12.2348 1.40117L5.73477 7.90117C5.53743 8.10549 5.42824 8.37914 5.43071 8.66319C5.43317 8.94723 5.54711 9.21895 5.74797 9.41981C5.94882 9.62067 6.22054 9.7346 6.50458 9.73707C6.78863 9.73953 7.06228 9.63034 7.2666 9.433Z"
                        fill="#03838C"
                      />
                    </svg>
                  )}
                  <span className="sm:text-[16px] text-[14px] text-[#657386] font-[700] flex items-center gap-2">
                    {isRabiesUploading && (
                      <Loader2 className="h-4 w-4 animate-spin text-[#03838C]" />
                    )}
                    {isRabiesUploading
                      ? "Uploading..."
                      : rabiesFile
                        ? rabiesFile.name
                        : rabiesUrl
                          ? rabiesUrl.split("/").pop()
                          : "Drag & Drop file here or"}
                  </span>
                  <div className="flex sm:flex-row flex-col items-center gap-2">
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        rabiesInputRef.current?.click();
                      }}
                      className="flex items-center gap-1 text-[13px] text-[#fff] bg-[#03838C] border border-[#03838C] rounded-[9px] px-3 py-1 font-medium cursor-pointer"
                    >
                      <span className="">
                        {" "}
                        <FileIcon className="w-4 h-4" />
                      </span>{" "}
                      Choose File
                    </div>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startCamera("rabies");
                      }}
                      className="flex items-center gap-1 text-[13px] text-[#1A2825] border border-[#DCE8E5] rounded-[9px] px-3 py-1 font-[600] cursor-pointer"
                    >
                      <span className="">
                        {" "}
                        <CameraIcon className="w-4 h-4" />
                      </span>{" "}
                      Take a photo
                    </div>
                  </div>
                  <span className="text-[12px] text-[#657386] mt-[6px] text-center">
                    {rabiesFile || rabiesUrl
                      ? "Click or drag a new file to replace the existing one"
                      : "You can upload JPG, PNG, PDF (up to 10 MB)"}
                  </span>
                </div>

                <div className="">
                  <p className="text-[13px] font-semibold text-[#14181F]">
                    Picture of Tag<span className="text-[#EF4444]">*</span>
                  </p>
                </div>

                <input
                  ref={tagInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileChange("tag")}
                />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => tagInputRef.current?.click()}
                  onKeyDown={(event) =>
                    event.key === "Enter" && tagInputRef.current?.click()
                  }
                  onDragOver={(event) => {
                    event.preventDefault();
                    setActiveDropzone("tag");
                  }}
                  onDragLeave={() => setActiveDropzone(null)}
                  onDrop={handleDrop("tag")}
                  className={`border-2 border-dashed rounded-[20px] sm:p-6 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                    activeDropzone === "tag" || tagFile || tagUrl
                      ? "border-[#03838C] bg-[#03838C]/5"
                      : "border-[#E5E7EB] hover:border-[#03838C]/50"
                  }`}
                >
                  {tagFile || tagUrl ? (
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
                        fill="#03838C"
                      />
                      <path
                        d="M7.2666 9.433L11.9174 4.78225V18.4171C11.9174 18.7044 12.0315 18.98 12.2347 19.1831C12.4378 19.3863 12.7134 19.5004 13.0007 19.5004C13.288 19.5004 13.5636 19.3863 13.7667 19.1831C13.9699 18.98 14.084 18.7044 14.084 18.4171V4.78225L18.7348 9.433C18.9391 9.63034 19.2127 9.73953 19.4968 9.73707C19.7808 9.7346 20.0525 9.62067 20.2534 9.41981C20.4543 9.21895 20.5682 8.94723 20.5707 8.66319C20.5731 8.37914 20.4639 8.10549 20.2666 7.90117L13.7666 1.40117C13.5634 1.19808 13.2879 1.08398 13.0007 1.08398C12.7134 1.08398 12.4379 1.19808 12.2348 1.40117L5.73477 7.90117C5.53743 8.10549 5.42824 8.37914 5.43071 8.66319C5.43317 8.94723 5.54711 9.21895 5.74797 9.41981C5.94882 9.62067 6.22054 9.7346 6.50458 9.73707C6.78863 9.73953 7.06228 9.63034 7.2666 9.433Z"
                        fill="#03838C"
                      />
                    </svg>
                  )}
                  <span className="sm:text-[16px] text-[14px] text-[#657386] font-[700] flex items-center gap-2">
                    {isTagUploading && (
                      <Loader2 className="h-4 w-4 animate-spin text-[#03838C]" />
                    )}
                    {isTagUploading
                      ? "Uploading..."
                      : tagFile
                        ? tagFile.name
                        : tagUrl
                          ? tagUrl.split("/").pop()
                          : "Drag & Drop file here or"}
                  </span>
                  <div className="flex sm:flex-row flex-col items-center gap-2">
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        tagInputRef.current?.click();
                      }}
                      className="flex items-center gap-1 text-[13px] text-[#fff] bg-[#03838C] border border-[#03838C] rounded-[9px] px-3 py-1 font-medium cursor-pointer"
                    >
                      <span className="">
                        {" "}
                        <FileIcon className="w-4 h-4" />
                      </span>{" "}
                      Choose File
                    </div>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startCamera("tag");
                      }}
                      className="flex items-center gap-1 text-[13px] text-[#1A2825] border border-[#DCE8E5] rounded-[9px] px-3 py-1 font-[600] cursor-pointer"
                    >
                      <span className="">
                        {" "}
                        <CameraIcon className="w-4 h-4" />
                      </span>{" "}
                      Take a photo
                    </div>
                  </div>
                  <span className="text-[12px] text-[#657386] mt-[6px] text-center">
                    {tagFile || tagUrl
                      ? "Click or drag a new file to replace the existing one"
                      : "You can upload JPG, PNG, PDF (up to 10 MB)"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelection("need-license")}
            onKeyDown={(event) =>
              event.key === "Enter" && setSelection("need-license")
            }
            className={`${optionBase} flex-col ${
              selection === "need-license"
                ? "border-[#03838C] bg-[#fff]"
                : "border-[#E5E7EB] bg-white"
            }`}
          >
            <div className="flex items-start gap-[18px] w-full">
              <div className="flex-shrink-0">
                <Image
                  src="/images/Background+Border1.svg"
                  alt="info"
                  width={52}
                  height={52}
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[16px] font-[700] text-[#1A2825]">
                  I would like to submit a license application
                </p>
                <p className="text-[14px] text-[#6B7F7C] leading-[24px] tracking-[-0.5px]">
                  I do not have a pet license and would like to obtain one for{" "}
                  {acknowledgmentDetails?.pet?.name || "your pet"}.
                </p>
              </div>
              <div className={radioBase}>
                {selection === "need-license" && (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#03838C]" />
                )}
              </div>
            </div>

            {selection === "need-license" && (
              <div className="mt-4 w-full space-y-4  bg-white ">
                <div className="space-y-0">
                  <p className="text-[16px] font-[700] text-[#1A2825]">
                    Choose How to Get Licensed
                  </p>
                  <p className="text-[14px] text-[#6B7F7C] leading-[24px] tracking-[-0.5px]">
                    Select the option that works best for you.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="rounded-[16px] border border-[#03838C] bg-[#fff] ">
                    <div className="shrink-0 px-[15px] py-[6px] rounded-b-[8px] w-fit mx-auto  bg-[#E0F4F5]  text-[14px] font-[700] text-[#03838C]">
                      Fastest Option
                    </div>
                    <div className="p-[22px]">
                      <div className=" ">
                        <div className="mx-auto text-center">
                          <div className="mb-[14px] w-[46px] h-[46px] mx-auto">
                            <Image
                              src="/images/Background+Border-2.svg"
                              alt="ggia"
                              width={46}
                              height={46}
                            />
                          </div>
                          <p className="text-[14px] font-[700] text-[#1A2825]">
                            File through Ggia
                          </p>
                          <p className="text-[12px] text-[#6B7F7C]">
                            We handle the paperwork for you.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[10px] bg-[#03838c0d] border border-[#03838c1f] p-[16px] mb-[24px] mt-[24px]">
                        <p className="text-[12px] font-[600] text-[#6B7F7C]">
                          What you get
                        </p>
                        <ul className=" space-y-[10px] text-[14px] text-[#1A2825] mt-[10px]">
                          <li className="flex items-center gap-2">
                            {" "}
                            <span className="font-[700]">
                              <Image
                                src="/images/Background+Border-3.svg"
                                alt="check"
                                width={16}
                                height={16}
                              />
                            </span>{" "}
                            We file the license on your behalf
                          </li>
                          <li className="flex items-center gap-2">
                            {" "}
                            <span className="font-[700]">
                              <Image
                                src="/images/Background+Border-3.svg"
                                alt="check"
                                width={16}
                                height={16}
                              />
                            </span>{" "}
                            $4 service fee + municipal fee
                          </li>
                          <li className="flex items-center gap-2">
                            {" "}
                            <span className="font-[700]">
                              <Image
                                src="/images/Background+Border-3.svg"
                                alt="check"
                                width={16}
                                height={16}
                              />
                            </span>{" "}
                            No government forms to fill out
                          </li>
                        </ul>
                      </div>

                      <AcknowledgementInfoSheet
                        trigger={
                          <Button
                            type="button"
                            className="w-full h-[44px] rounded-[12px] bg-[#03838C] hover:bg-[#036b73] text-white font-semibold text-[14px] cursor-pointer"
                          >
                            Get Started
                            <ArrowRight className="ml-1 w-4 h-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-[#DCE8E5] bg-white p-[23px]">
                    <div className="mx-auto text-center">
                      <div className="mb-[14px] w-[46px] h-[46px] mx-auto">
                        <Image
                          src="/images/Background+Border-4.svg"
                          alt="ggia"
                          width={46}
                          height={46}
                        />
                      </div>
                      <p className="text-[14px] font-[700] text-[#1A2825]">
                        Go to Municipality Site
                      </p>
                      <p className="text-[12px] text-[#6B7F7C]">
                        File directly with {municipalityName}{" "}
                        <span className="text-[#03838ccc] font-[500]">
                          uses a paper-based process{" "}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-[12px] border border-[#EAEDF0] mt-[24px] ">
                      <div className="flex items-center justify-between px-3 py-3 border-b border-[rgba(3,131,140,0.10)] bg-[rgba(3,131,140,0.05)] rounded-t-[12px]">
                        <p className="text-[12px] font-[700] text-[#14181F]">
                          {municipalityName} Fee Example
                        </p>
                      </div>
                      <div className="divide-y divide-[#EAEDF0] text-[14px] text-[#14181F]">
                        <div className="flex items-center justify-between px-3 py-3">
                          <span>Spayed/Neutered</span>
                          <span className="font-[700]">$15</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-3">
                          <span>Not Spayed/Neutered</span>
                          <span className="font-[700]">$20</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-3 rounded-b-[12px]">
                          <span>Late fees (after March 31)</span>
                          <span className="font-[700]">$20</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-[24px]">
                      <MunicipalitySiteDialog
                        onContinue={handleMunicipalityOption}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 h-[46px] rounded-[12px] border border-input text-[#14181F] hover:bg-[#F5F5F5] font-medium cursor-pointer"
            >
              <ArrowLeft className="ml-1 w-4 h-4" /> Back
            </Button>
            <Button
              type="button"
              onClick={handleContinue}
              disabled={
                !selection ||
                isRabiesUploading ||
                isTagUploading ||
                isSubmitting
              }
              className="flex-1 h-[46px] rounded-[12px] bg-[#03838C] hover:bg-[#036b73] disabled:bg-[#A7CCD0] disabled:cursor-not-allowed text-white font-[600] sm:text-[16px] text-[14px] cursor-pointer flex items-center justify-center"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Continue
              <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AcknowledgementChoiceStep;
