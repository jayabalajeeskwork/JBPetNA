import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
export function ApplicationStatusCard() {
  return (
    <Card className="border-0 rounded-[16px] bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] p-0">
      <CardContent className="p-[24px]">
        <div className=" border border-[#E5E7EB]  sm:p-[24px] p-[12px] rounded-[16px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-5 border-b border-[#DCE8E5]">
            <div className="flex items-center gap-2 ">
              <div className="flex-shrink-0">
               <Image src="/images/click3.svg" alt="application-status" width={28} height={28} />
              </div>
              <h2 className="text-[14px] sm:text-[16px] font-[700] text-[#1A2825]">
                Application Status
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F4F1] border border-[#03838c2e] px-[12px] py-[6px] text-[12px] sm:text-[12px] font-[700] text-[#03838C] self-start sm:self-auto">
            ✓
              Application Submitted
            </span>
          </div>

          <p className="text-[14px] sm:text-[14px] font-[400] text-[#6B7F7C] leading-[24px]">
            Your application has been <span className="font-[600] text-[#1A2825]">successfully submitted</span> to
            {" "}
            West Orange Municipality.
          </p>
          <p className="text-[14px] sm:text-[14px] font-[400] text-[#6B7F7C]  leading-[24px]">
            You will receive your license certificate within{" "}
            <span className="font-[600] text-[#1A2825]">5–7 business days.</span>
          </p>

          <div className="rounded-[14px] border border-[#E5E7EB] overflow-hidden mt-[24px]">
            <div className=" px-[12px] sm:px-[13px] py-[12px]  flex items-center justify-between border-b border-[rgba(3,131,140,0.10)] bg-[rgba(3,131,140,0.05)]">
              <p className="text-[13px] sm:text-[14px] font-[600] text-[#14181F]">
                Application Summary
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 ">
              <div className="border-b sm:border-b-0 sm:border-r border-[#E5E7EB] py-[12px]">
                <p className="text-[12px] font-[700] text-[#6B7F7C] mb-3 px-[12px]">
                  Pet Information
                </p>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-4 px-[12px]">
                    <p className="text-[14px] text-[#14181fcc]">Name:</p>
                    <p className="text-[14px] font-[700] text-[#14181F] text-right">
                      Sky
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between gap-4  border-t border-[#E5E7EB] pt-3 mt-2 px-[12px]">
                    <p className="text-[14px] text-[#14181fcc]">Breed:</p>
                    <p className="text-[14px] font-[700] text-[#14181F] text-right">
                      Golden Retriever
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between gap-4  border-t border-[#E5E7EB] pt-3 mt-2 px-[12px]">
                    <p className="text-[14px] text-[#14181fcc]">Spay/Neuter:</p>
                    <p className="text-[14px] font-[700] text-[#14181F] text-right">
                      Yes
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-[12px]">
                <p className="text-[12px] font-[700] text-[#6B7F7C] mb-3 px-[12px]">
                  Payment Details
                </p>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-4 px-[12px]">
                    <p className="text-[14px] text-[#14181fcc]">Municipal Fee:</p>
                    <p className="text-[14px] font-[700] text-[#14181F] text-right">
                      $15.00
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between gap-4  border-t border-[#E5E7EB] pt-3 mt-2 px-[12px]">
                    <p className="text-[14px] text-[#14181fcc]">Service Fee:</p>
                    <p className="text-[14px] font-[700] text-[#14181F] text-right">
                      $4.00
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-[#E5E7EB] pt-3 mt-2 px-[12px]">
                    <p className="text-[14px] text-[#14181fcc]">Total Paid:</p>
                    <p className="text-[14px] font-[700] text-[#14181F] text-right">
                      $19.00
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-[24px] rounded-[16px] border border-[#E5E7EB] bg-white p-[20px]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3  pb-[12px] border-b border-[#DCE8E5]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0">
           <Image src="/images/recipet.svg" alt="confirmation-receipt" width={28} height={28} />
              </div>
              <p className="text-[14px] sm:text-[16px] font-[700] text-[#1A2825]">
                Confirmation Receipt
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-[2px]">
              <span className="text-[11px] sm:text-[12px] font-[400] tracking-[0.02em] uppercase text-[#6B7F7C]">
                Confirmation #
              </span>
              <button
                type="button"
                className="text-[13px] sm:text-[14px] font-[600] text-[#03838C] hover:underline underline-offset-2"
              >
                GG-20251215-4782
              </button>
            </div>
          </div>

          <div className=" pt-[12px]">
            <p className="text-[13px] sm:text-[14px] font-[400] text-[#6B7F7C]">
              Keep this for your records.
            </p>
          </div>

          <div className=" py-[14px] pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex  items-center justify-center ">
              <Image src="/images/pdf.svg" alt="pdf" width={40} height={40} />
              </div>
              <div>
                <p className="text-[14px] font-[600] text-[#1A2825]">
                  Receipt &amp; Application Copy
                </p>
                <p className="text-[12px] font-[400] text-[#6B7F7C] mt-[2px]">
                  PDF • 245kb
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-[9px] bg-[#03838C] px-[18px] py-[8px] text-[13px] font-[600] text-white hover:bg-[#026770] transition-colors cursor-pointer h-[34px]"
            >
              <span className=""><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
  <g clipPath="url(#clip0_564_1020)">
    <path d="M12.834 7.58398C12.6793 7.58398 12.5309 7.64544 12.4215 7.75484C12.3121 7.86424 12.2507 8.01261 12.2507 8.16732V10.6249C12.2502 11.0559 12.0788 11.4692 11.774 11.774C11.4692 12.0788 11.0559 12.2502 10.6249 12.2507H3.3764C2.94537 12.2502 2.53212 12.0788 2.22733 11.774C1.92255 11.4692 1.75111 11.0559 1.75065 10.6249V8.16732C1.75065 8.01261 1.68919 7.86424 1.5798 7.75484C1.4704 7.64544 1.32203 7.58398 1.16732 7.58398C1.01261 7.58398 0.864235 7.64544 0.754839 7.75484C0.645443 7.86424 0.583984 8.01261 0.583984 8.16732V10.6249C0.584756 11.3653 0.879205 12.0751 1.40272 12.5986C1.92623 13.1221 2.63604 13.4165 3.3764 13.4173H10.6249C11.3653 13.4165 12.0751 13.1221 12.5986 12.5986C13.1221 12.0751 13.4165 11.3653 13.4173 10.6249V8.16732C13.4173 8.01261 13.3559 7.86424 13.2465 7.75484C13.1371 7.64544 12.9887 7.58398 12.834 7.58398Z" fill="white"/>
    <path d="M3.91241 6.00437L6.41666 8.50862V1.16679C6.41666 1.01208 6.47812 0.863708 6.58751 0.754313C6.69691 0.644916 6.84528 0.583458 6.99999 0.583458C7.1547 0.583458 7.30308 0.644916 7.41247 0.754313C7.52187 0.863708 7.58333 1.01208 7.58333 1.16679V8.50862L10.0876 6.00437C10.1976 5.89812 10.3449 5.83932 10.4979 5.84065C10.6508 5.84198 10.7972 5.90333 10.9053 6.01148C11.0135 6.11964 11.0748 6.26594 11.0761 6.41889C11.0775 6.57184 11.0187 6.71919 10.9124 6.82921L7.41241 10.3292C7.30302 10.4386 7.15467 10.5 6.99999 10.5C6.84531 10.5 6.69697 10.4386 6.58758 10.3292L3.08758 6.82921C2.98132 6.71919 2.92252 6.57184 2.92385 6.41889C2.92518 6.26594 2.98653 6.11964 3.09468 6.01148C3.20284 5.90333 3.34914 5.84198 3.50209 5.84065C3.65504 5.83932 3.80239 5.89812 3.91241 6.00437Z" fill="white"/>
  </g>
  <defs>
    <clipPath id="clip0_564_1020">
      <rect width="14" height="14" fill="white"/>
    </clipPath>
  </defs>
</svg></span>
              <span>Download</span>
            </button>
          </div>
        </div>


 

          {/* What happens next */}
          <div className="w-full rounded-[18px] border border-[#E5E7EB] bg-white text-left p-[20px] mt-[24px]">
            <div className="border-b border-[#E5E7EB] pb-[15px] flex items-center gap-[10px]">
              <div className="flex items-center justify-center flex-shrink-0">
                <Image src="/images/next.svg" alt="next-steps-icon" width={28} height={28} />
              </div>
              <p className="text-[14px] font-[700] text-[#1A2825]">
                What Happens Next
              </p>
            </div>

            <div className="mt-[18px] flex gap-[16px] text-[13px]">
              {/* Timeline icons and connector */}
              <div className="flex flex-col gap-[9px] relative z-10 text-[#1A2825] sm:text-[16px] text-[12px] font-[400]">
                <div className="absolute top-0 left-0 h-full max-h-[150px] border-l-1 border-dashed border-[#E5E7EB] left-3.5 -translate-x-1/2 z-[-1]" />
                {/* Step 1 icon */}
                <div className="  flex items-start gap-[16px]">
            <Image src="/images/processing.svg" alt="info-icon" width={28} height={28} />
            <p className="text-[#1A2825] font-[500] text-[16px]">
            Municipality Processing
            <div className="text-[#6B7F7C] font-[400] text-[12px]">
            West Orange will review and process your application within 3-5 business days.
            </div>
                </p>
                </div>
                <div className="w-[2px] flex-1 bg-[#E5E7EB] my-[4px]" />
                {/* Step 2 icon */}
                <div className="  flex items-start gap-[16px]">
                <Image src="/images/bell2.svg" alt="info-icon" width={28} height={28} />
                <p className="text-[#1A2825] font-[500] text-[16px]">
                License Certificate
                <div className="text-[#6B7F7C] font-[400] text-[12px]">
                You&apos;ll receive your official license certificate by mail and email.
                </div>  
                </p>
                </div>
                <div className="w-[2px] flex-1 bg-[#E5E7EB] my-[4px]" />
                {/* Step 3 icon */}
                <div className="  flex items-start gap-[16px]">
                <Image src="/images/licence.svg" alt="info-icon" width={28} height={28} />
                <p className="text-[#1A2825] font-[500] text-[16px]">
                License Certificate
                <div className="text-[#6B7F7C] font-[400] text-[12px]">
                Your groomer/daycare will be notified and can proceed with services.
                </div>
                </p>
                </div>
              </div>

            </div>
          </div>

  {/* Information shared section */}
  <div className="w-full rounded-[18px] border border-[#E5E7EB] bg-white text-left p-[20px] mt-[24px]">
            <div className=" border-b border-[#E5E7EB] flex items-center gap-[10px] pb-[15px]">
              <div className="flex items-center justify-center flex-shrink-0">
              <Image src="/images/final-step.svg" alt="info-icon" width={28} height={28} />
              </div>
              <p className="text-[14px] font-[700] text-[#1A2825]">
              Final Step: Submit Acknowledgement
              </p>
            </div>
            <div className=" text-[13px] mt-[15px]">
              <p className="text-[14px] font-[400] text-[#1a2825cc] ">
              Confirm that you <span className="font-[600] text-[#1A2825]">understand</span>  the municipal licensing requirements and have <span className="font-[600] text-[#1A2825]">submitted</span> your application.
               
              </p>
              <p className="text-[#6B7F7C] sm:text-[14px] text-[12px] rounded-[14px] border border-[rgba(3,131,140,0.18)] bg-[linear-gradient(100deg,rgba(13,140,122,0.04)_0%,rgba(13,140,122,0.02)_100%)] p-[20px] flex items-start gap-[12px] mt-[14px]">
                <div className="flex items-center justify-center flex-shrink-0"  ><Image src="/images/tick.svg" alt="info-icon" width={24} height={24} /></div>
                I acknowledge that I understand West Orange&apos;s pet licensing requirements and have successfully submitted my application through Ggia. I understand that my license certificate will be mailed to me within 5-7 business days.
              </p>
            </div>
          </div>
  {/* Close button */}
  <Button
            type="button"
          
            className="w-full h-[48px] rounded-[12px] bg-[#03838C] hover:bg-[#036b73] text-white font-semibold text-[14px] cursor-pointer mt-6"
          >
   Submit Acknowledgement  ✓
          </Button>
      </CardContent>
    </Card>
  );
}

