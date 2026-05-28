"use client";

import { ArrowLeft, ArrowRight, Check, CrossIcon } from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

type MunicipalitySiteDialogProps = {
  continueUrl?: string;
  onContinue?: () => Promise<void>;
};

const MunicipalitySiteDialog = ({
  continueUrl = "https://www.gia.com/continue",
  onContinue,
}: MunicipalitySiteDialogProps) => {
  const handleMunicipalityContinue = async () => {
    if (onContinue) {
      await onContinue();
    }
    if (typeof window === "undefined") return;
    window.open(continueUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full h-[44px] rounded-[12px] border border-input text-[#14181F] hover:bg-[#F5F5F5] font-medium cursor-pointer"
        >
          Visit Municipality Site <ArrowRight className="ml-1 w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[640px] !p-[44px]">
        <DialogHeader>
          <DialogTitle className="text-[24px] font-[700] text-[#14181F]">
            Completing the acknowledgement after filing directly with your
            municipality.
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-left">
          <div className="rounded-[14px] border border-[rgba(3,131,140,0.18)] bg-[linear-gradient(100deg,rgba(13,140,122,0.04)_0%,rgba(13,140,122,0.02)_100%)] p-[20px] flex gap-2">
            <div className="w-4 h-4 shrink-0 rounded-full border border-green-600/50 bg-green-500/10 flex justify-center items-center mt-[3px]">
              <Check className="text-green-600 w-2.5" />
            </div>
            <p className="text-[14px] font-[600] text-[#6B7F7C] mb-[5px]">
              Thanks for acknowledging, we have alerted the groomer that you
              have completed the acknowledgement
            </p>
          </div>
          <div className="bg-[#DCE8E5] h-[1px] w-full my-[24px]"></div>
          <p className="text-[14px] font-[400] text-[#1a2825cc]">
            If you decide to come back and complete your application with us,
            please use the same acknowledgement link.
          </p>
        </div>

        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-[44px] rounded-[12px] border border-input text-[#14181F] hover:bg-[#F5F5F5] font-medium cursor-pointer"
            >
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
                  d="M4.16706 14.6555C4.0107 14.8119 3.92285 15.024 3.92285 15.2451C3.92285 15.4662 4.0107 15.6783 4.16706 15.8347C4.32343 15.9911 4.53551 16.0789 4.75665 16.0789C4.97778 16.0789 5.18986 15.9911 5.34623 15.8347L10.0004 11.1789L14.6554 15.8339C14.8126 15.9857 15.0231 16.0696 15.2416 16.0677C15.4601 16.0659 15.6691 15.9782 15.8236 15.8237C15.9781 15.6692 16.0657 15.4602 16.0676 15.2417C16.0695 15.0232 15.9855 14.8127 15.8337 14.6555L11.1787 10.0005L15.8337 5.34552C15.99 5.18915 16.0777 4.97712 16.0777 4.75606C16.0776 4.535 15.9897 4.32303 15.8333 4.16677C15.6769 4.01051 15.4649 3.92277 15.2439 3.92285C15.0228 3.92293 14.8108 4.01082 14.6546 4.16719L10.0004 8.82219L5.3454 4.16719C5.18823 4.01539 4.97773 3.93139 4.75923 3.93329C4.54073 3.93519 4.33172 4.02283 4.17722 4.17734C4.02271 4.33184 3.93507 4.54086 3.93317 4.75935C3.93127 4.97785 4.01527 5.18835 4.16706 5.34552L8.82207 10.0005L4.16706 14.6555Z"
                  fill="#171717"
                />
              </svg>{" "}
              Close
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="flex-1 h-[44px] rounded-[12px] bg-[#03838C] hover:bg-[#036b73] text-white font-semibold text-[14px] cursor-pointer"
            onClick={handleMunicipalityContinue}
          >
            Continue
            <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MunicipalitySiteDialog;
