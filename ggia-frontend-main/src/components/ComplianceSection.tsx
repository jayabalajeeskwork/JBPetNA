"use client";
import Image from "next/image";
const steps = [
  {
    title: "Pet Family Info",
    description: "Tell us about your pet and place of residence.",
    icon: "/images/check.svg",
  },
  {
    title: "Verify or Upload",
    description: "Upload a photo of your rabies record.",
    icon: "/images/check1.svg",
  },
  {
    title: "Easy Registration",
    description: "Upload picture of your pet and pay the needed fee.",
    icon: "/images/check2.svg",
  },
];

export default function ComplianceSection() {
  return (
    <section className="bg-[#E5F4F1]">
      <div className="mx-auto max-w-5xl px-4 sm:py-16 py-[30px] ">
        <h2 className="text-center sm:text-[48px] text-[34px] font-[700] text-[#222] leading-tight">
          Get Compliant in Minutes
        </h2>

        <div className="relative mt-10 md:mt-12">
          <div
            className="absolute left-[12%] right-[12%] top-[1.75rem] z-[0] hidden h-px bg-[#04838c33] md:block"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            {steps.map((step) => (
              <div
                key={step.title}
                className="mx-auto flex max-w-xs flex-col items-center text-center"
              >
                <div className="mb-4 flex items-center justify-center relative z-[9] bg-[#E2F1F1] w-[100px]">
                  <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#067D73] text-white">
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={64}
                      height={64}
                    />
                  </div>
                </div>

                <h3 className="text-[18px] font-[600] text-[#222] leading-[28px]">
                  {step.title}
                </h3>
                <p className=" text-[16px] font-[400] leading-relaxed text-[#6A7181]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
