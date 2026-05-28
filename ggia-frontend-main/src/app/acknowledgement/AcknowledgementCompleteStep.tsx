"use client";

import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Image from "next/image";
import { useStore } from "@/stores/useStore";
import { format } from "date-fns";
import { toast } from "sonner";

type AcknowledgementCompleteStepProps = {
  onClose: () => void;
};

const AcknowledgementCompleteStep = ({
  onClose,
}: AcknowledgementCompleteStepProps) => {
  const { acknowledgmentDetails } = useStore();

  if (!acknowledgmentDetails) return null;

  const pet = acknowledgmentDetails.pet || {};
  const breedStr = Array.isArray(pet.breed) 
    ? pet.breed.join(" · ") 
    : (pet.breed || "");

  const handleCopy = () => {
    const id = acknowledgmentDetails.acknowledgmentId || acknowledgmentDetails._id || acknowledgmentDetails.id || "N/A";
    navigator.clipboard.writeText(id);
    toast.success("ID copied to clipboard");
  };
  return (
    <Card className="w-full max-w-[720px] mt-[32px] border-0 sm:p-[40px] p-[20px] shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] rounded-[16px] bg-white/90">
      <CardContent className="p-0">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Heading */}
          {/* <div className="space-y-2">
            <h1 className="text-[26px] sm:text-[32px] font-bold text-[#14181F]">
              Acknowledgement Complete!
            </h1>
            <p className="text-[14px] sm:text-[16px] text-[#657386] max-w-[360px] mx-auto">
              Thank you for completing your pet licensing acknowledgement.
            </p>
          </div> */}

          {/* Confirmation details card */}
          <p className="text-[24px] block mr-auto font-[700] text-[#14181F]">
            Confirmation Details
          </p>
          <div className="w-full rounded-[16px] border border-[#EAEDF0] bg-white text-left">
            <div className=" grid grid-cols-1 sm:grid-cols-2  text-[13px]">
              <div className="space-y-1 border-r border-[#E5E7EB] p-[20px]">
                <p className="text-[#6B7F7C] text-[12px] font-[700]">
                  Acknowledgement ID
                </p>
                <p className="font-[600] text-[#1A2825] break-all flex items-center gap-2 mt-[6px]">
                  {acknowledgmentDetails.acknowledgmentId || acknowledgmentDetails._id || acknowledgmentDetails.id || "N/A"}{" "}
                  <span className="cursor-pointer" onClick={handleCopy}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      viewBox="0 0 19 19"
                      fill="none"
                    >
                      <path
                        d="M15.8333 7.125H8.70833C7.83388 7.125 7.125 7.83388 7.125 8.70833V15.8333C7.125 16.7078 7.83388 17.4167 8.70833 17.4167H15.8333C16.7078 17.4167 17.4167 16.7078 17.4167 15.8333V8.70833C17.4167 7.83388 16.7078 7.125 15.8333 7.125Z"
                        stroke="#03838C"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M5.01392 12.9303H4.22225C3.80232 12.9303 3.3996 12.7635 3.10266 12.4666C2.80573 12.1697 2.63892 11.7669 2.63892 11.347V4.22201C2.63892 3.80208 2.80573 3.39935 3.10266 3.10242C3.3996 2.80549 3.80232 2.63867 4.22225 2.63867H11.3473C11.7672 2.63867 12.1699 2.80549 12.4668 3.10242C12.7638 3.39935 12.9306 3.80208 12.9306 4.22201V5.01367"
                        stroke="#03838C"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </p>
              </div>
              <div className="space-y-1 p-[20px]">
                <p className="text-[#657386] font-[600]">Timestamp</p>
                <p className="text-[#1A2825] sm:text-[16px] text-[12px] font-[600]">
                  {acknowledgmentDetails.updatedAt 
                    ? format(new Date(acknowledgmentDetails.updatedAt), "MMMM d, yyyy 'at' h:mm a")
                    : "N/A"}
                </p>
              </div>
              <div className="space-y-1 border-t p-[20px] border-[#E5E7EB] border-r border-[#E5E7EB]">
                <p className="text-[#657386] font-[600]">Pet</p>
                <div className="text-[#1A2825] sm:text-[16px] text-[12px] font-[600]">
                  {pet.name || "N/A"} · {breedStr || "N/A"}
                  <p className="text-[#6B7F7C] text-[12px] font-[400] mt-[6px] flex items-center gap-2">
                    License Status:{" "}
                    <span className="text-[#03838C] px-[10px] py-[4px] rounded-full border border-[#03838c2e] bg-[#E6F4F1]">
                      ✓ {acknowledgmentDetails.isLicenseFilled ? "Confirmed" : "Pending"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-1 border-t p-[20px] border-[#E5E7EB]">
                <p className="text-[#657386] font-[600]">Service Provider</p>
                <p className="text-[#1A2825] sm:text-[16px] text-[12px] font-[600]">
                  {acknowledgmentDetails.groomerId?.businessName || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Information shared section */}
          <div className="w-full rounded-[18px] border border-[#E5E7EB] bg-white text-left p-[20px]">
            <div className=" border-b border-[#E5E7EB] flex items-center gap-[10px] pb-[15px]">
              <div className="flex items-center justify-center">
                <Image
                  src="/images/Backgroud6.svg"
                  alt="info-icon"
                  width={28}
                  height={28}
                />
              </div>
              <p className="text-[14px] font-[700] text-[#1A2825]">
                Information Shared with Groomer/Daycare
              </p>
            </div>
            <div className="space-y-2 text-[13px] mt-[15px]">
              <p className="text-[#1a2825cc] font-[400] flex items-center gap-2">
                <span className="flex-shrink-0">
                  <Image
                    src="/images/Background+Border-3.svg"
                    alt="info-icon"
                    width={14}
                    height={14}
                  />
                </span>{" "}
                Pet licensing acknowledgement has been shared with
                <span className="font-[600] sm:text-[14px] text-[12px] text-[#1A2825] ">
                  {" "}{acknowledgmentDetails.groomerId?.businessName || "N/A"}
                </span>
                .
              </p>
              <div className="text-[#6B7F7C] sm:text-[14px] text-[12px] rounded-[14px] border border-[rgba(3,131,140,0.18)] bg-[linear-gradient(100deg,rgba(13,140,122,0.04)_0%,rgba(13,140,122,0.02)_100%)] sm:px-[16px] px-[10px] sm:py-[14px] py-[10px] flex items-center gap-[12px] mt-[14px]">
                <div className="flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/images/Background.svg"
                    alt="info-icon"
                    width={34}
                    height={34}
                  />
                </div>
                You can share this acknowledgement with other providers by
                returning to this site and requesting a share with others.
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="w-full rounded-[18px] border border-[#E5E7EB] bg-white text-left p-[20px]">
            <div className="border-b border-[#E5E7EB] pb-[15px] flex items-center gap-[10px]">
              <div className="flex items-center justify-center">
                <Image
                  src="/images/Backgroud6.svg"
                  alt="next-steps-icon"
                  width={28}
                  height={28}
                />
              </div>
              <p className="text-[14px] font-[700] text-[#1A2825]">
                What Happens Next
              </p>
            </div>

            <div className="mt-[18px] flex gap-[16px] text-[13px]">
              {/* Timeline icons and connector */}
              <div className="flex flex-col gap-[9px] relative z-10 text-[#1A2825] sm:text-[16px] text-[12px] font-[400]">
                <div className="absolute top-0 left-0 h-full border-l-1 border-dashed border-[#E5E7EB] left-3.5 -translate-x-1/2 z-[-1]" />
                {/* Step 1 icon */}
                <div className="  flex items-start gap-[16px]">
                  <Image
                    src="/images/bell1.svg"
                    alt="info-icon"
                    width={28}
                    height={28}
                  />
                  <p>
                    Your groomer/daycare has been notified of your completed
                    acknowledgement.
                  </p>
                </div>
                <div className="w-[2px] flex-1 bg-[#E5E7EB] my-[4px]" />
                {/* Step 2 icon */}
                <div className="  flex items-start gap-[16px]">
                  <Image
                    src="/images/bell2.svg"
                    alt="info-icon"
                    width={28}
                    height={28}
                  />
                  <p>
                    A copy of this acknowledgement has been sent to your email
                    address for the records.
                  </p>
                </div>
                <div className="w-[2px] flex-1 bg-[#E5E7EB] my-[4px]" />
                {/* Step 3 icon */}
                <div className="  flex items-start gap-[16px]">
                  <Image
                    src="/images/bell3.svg"
                    alt="info-icon"
                    width={28}
                    height={28}
                  />
                  <p>Keep your confirmation ID for future reference.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Close button */}
          <Button
            type="button"
            onClick={onClose}
            className="w-full h-[48px] rounded-[12px] bg-[#03838C] hover:bg-[#036b73] text-white font-semibold text-[14px] cursor-pointer mt-2"
          >
            Close{" "}
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.16706 14.6545C4.0107 14.8109 3.92285 15.023 3.92285 15.2441C3.92285 15.4653 4.0107 15.6773 4.16706 15.8337C4.32343 15.9901 4.53551 16.0779 4.75665 16.0779C4.97778 16.0779 5.18986 15.9901 5.34623 15.8337L10.0004 11.1779L14.6554 15.8329C14.8126 15.9847 15.0231 16.0687 15.2416 16.0668C15.4601 16.0649 15.6691 15.9772 15.8236 15.8227C15.9781 15.6682 16.0657 15.4592 16.0676 15.2407C16.0695 15.0222 15.9855 14.8117 15.8337 14.6545L11.1787 9.99954L15.8337 5.34454C15.99 5.18818 16.0777 4.97614 16.0777 4.75508C16.0776 4.53402 15.9897 4.32205 15.8333 4.16579C15.6769 4.00954 15.4649 3.9218 15.2439 3.92188C15.0228 3.92195 14.8108 4.00984 14.6546 4.16621L10.0004 8.82121L5.3454 4.16621C5.18823 4.01441 4.97773 3.93042 4.75923 3.93232C4.54073 3.93421 4.33172 4.02185 4.17722 4.17636C4.02271 4.33087 3.93507 4.53988 3.93317 4.75838C3.93127 4.97687 4.01527 5.18738 4.16706 5.34454L8.82207 9.99954L4.16706 14.6545Z"
                  fill="white"
                />
              </svg>
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AcknowledgementCompleteStep;
