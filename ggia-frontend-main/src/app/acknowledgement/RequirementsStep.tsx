import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";

type RequirementsStepProps = {
  onBack: () => void;
  onContinue: () => void;
};

const bulletBase =
  "flex items-start gap-3 pb-[20px] mt-[24px] text-[14px] text-[#14181F] border-b border-[#DCE8E5] last:border-b-0";

const iconWrapper =
  "  flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#E6F4F1] text-[#03838C] border border-[#03838c33] shrink-0";

const RequirementsStep = ({ onBack, onContinue }: RequirementsStepProps) => {
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  return (
    <Card className="w-full max-w-[640px] mt-[32px] border-0 sm:p-[38px] p-[18px] shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] rounded-[16px] bg-[#fff0] overflow-hidden">
      <CardHeader className="flex sm:flex-row flex-col sm:items-center items-start justify-between  p-0">
        <CardTitle className="sm:text-[24px] text-[18px] font-[700] text-[#171717]">
          Pet Licensing Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-3">
        {/* Info banner */}
        <div className="border border-[rgba(3,131,140,0.18)] bg-[linear-gradient(100deg,rgba(13,140,122,0.04)_0%,rgba(13,140,122,0.02)_100%)] rounded-[12px] px-4 py-3 flex gap-[12px]">
          <div className="flex items-start mt-[4px]">
            <Image
              src="/images/Background.svg"
              alt="info"
              width={42}
              height={42}
            />
          </div>
          <div className="space-y-[6px]">
            <p className="text-[16px] font-[600] text-[#03838C]">
              Please read carefully
            </p>
            <p className="text-[12px] text-[#657386] leading-[20px]">
              These are the official state requirements for your area.
              You&apos;ll be asked to acknowledge them in the next step before
              submitting your license.
            </p>
          </div>
        </div>

        {/* Requirement bullets */}
        <div className="space-y-1">
          <div className={`${bulletBase} bg-white `}>
            <div className={iconWrapper}>
              <span className="text-[11px] font-[800]">1</span>
            </div>
            <p className="text-[14px] font-[400] text-[#6B7F7C]">
              <span className="text-[#1A2825] font-[700]">
                {" "}
                All dogs 7 months of age or older{" "}
              </span>{" "}
              must be{" "}
              <span className="text-[#03838C] font-[600]">
                {" "}
                licensed annually{" "}
              </span>{" "}
              in the municipality where the pet is kept.
            </p>
          </div>

          <div className={bulletBase}>
            <div className={iconWrapper}>
              <span className="text-[11px] font-[800]">2</span>
            </div>
            <p>
              To get a license, you must show{" "}
              <span className="text-[#1A2825] font-[700]">
                {" "}
                proof the pet has a current rabies vaccination{" "}
              </span>{" "}
              from a licensed veterinarian. The vaccination&apos;s immunity must
              cover at least{" "}
              <span className="text-[#03838C] font-[600]">
                {" "}
                10 of the 12 months{" "}
              </span>{" "}
              of the license period.
            </p>
          </div>

          <div className={bulletBase}>
            <div className={iconWrapper}>
              <span className="text-[11px] font-[800]">3</span>
            </div>
            <p>
              <span className="text-[#1A2825] font-[700]">
                {" "}
                If your pet cannot be vaccinated{" "}
              </span>{" "}
              for medical reasons, a veterinarian can issue a{" "}
              <span className="text-[#1A2825] font-[700]">
                {" "}
                medical exemption certificate{" "}
              </span>{" "}
              that allows licensing without the rabies shot.
            </p>
          </div>

          <div className={bulletBase}>
            <div className={iconWrapper}>
              <span className="text-[11px] font-[800]">4</span>
            </div>
            <p>
              Once issued, a{" "}
              <span className="text-[#1A2825] font-[700]">
                metal registration tag
              </span>{" "}
              must be attached to the dog&apos;s{" "}
              <span className="font-[600] text-[#03838C]">
                collar or harness.
              </span>
            </p>
          </div>

          <div className={bulletBase}>
            <div className={iconWrapper}>
              <span className="text-[11px] font-[800]">5</span>
            </div>
            <p>
              You must license a newly acquired dog or one that just reached{" "}
              &quot;licensing age&quot; within{" "}
              <span className="text-[#1A2825] font-[700]"> 10 days</span> of
              acquisition or age attainment.
            </p>
          </div>
        </div>

        {/* Statute box */}
        <div className="mt-3 border border-[#DCE8E5] bg-[#F4F7F6] rounded-[12px] p-[16px] space-y-2">
          <p className="text-[12px] text-[#6B7F7C]">
            This requirement is set out in{" "}
            <span className="font-[600] text-[#14181F]">
              New Jersey Statutes (e.g., N.J.S.A. 4:19-15.2)
            </span>{" "}
            and administered by the NJ Department of Health&apos;s Veterinary
            Public Health office.
          </p>
          <button
            type="button"
            className="text-[12px] font-[600] text-[#03838C] inline-flex items-center cursor-pointer gap-2 underline-offset-2 hover:underline"
          >
            Read full statute
            <span aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <g clipPath="url(#clip0_461_592)">
                  <path
                    d="M7.5 0C7.08516 0 6.75 0.335156 6.75 0.75C6.75 1.16484 7.08516 1.5 7.5 1.5H9.43828L4.72031 6.22031C4.42734 6.51328 4.42734 6.98906 4.72031 7.28203C5.01328 7.575 5.48906 7.575 5.78203 7.28203L10.5 2.56172V4.5C10.5 4.91484 10.8352 5.25 11.25 5.25C11.6648 5.25 12 4.91484 12 4.5V0.75C12 0.335156 11.6648 0 11.25 0H7.5ZM1.875 0.75C0.839062 0.75 0 1.58906 0 2.625V10.125C0 11.1609 0.839062 12 1.875 12H9.375C10.4109 12 11.25 11.1609 11.25 10.125V7.5C11.25 7.08516 10.9148 6.75 10.5 6.75C10.0852 6.75 9.75 7.08516 9.75 7.5V10.125C9.75 10.3313 9.58125 10.5 9.375 10.5H1.875C1.66875 10.5 1.5 10.3313 1.5 10.125V2.625C1.5 2.41875 1.66875 2.25 1.875 2.25H4.5C4.91484 2.25 5.25 1.91484 5.25 1.5C5.25 1.08516 4.91484 0.75 4.5 0.75H1.875Z"
                    fill="#03838C"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_461_592">
                    <path d="M0 0H12V12H0V0Z" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
          </button>
        </div>

        {/* Acknowledgment Checkbox */}
        <div
          className="flex items-center gap-2 mt-4 cursor-pointer"
          onClick={() => setIsAcknowledged(!isAcknowledged)}
        >
          <Checkbox
            checked={isAcknowledged}
            onCheckedChange={(checked) => setIsAcknowledged(checked === true)}
          />
          <p className="text-[14px] text-[#6B7F7C] leading-tight">
            I acknowledge that I am aware of the license laws for pet licensing.
          </p>
        </div>

        {/* Actions */}
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
            onClick={onContinue}
            disabled={!isAcknowledged}
            className="flex-1 h-[46px] rounded-[12px] bg-[#03838C] hover:bg-[#036b73] text-white font-[600] sm:text-[16px] text-[14px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequirementsStep;
