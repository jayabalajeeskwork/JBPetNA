"use client";
import { useState } from "react";
import Image from "next/image";

export default function PetParentsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
    className="w-full bg-white py-12 md:py-16 lg:py-20 max-w-[1440px] mx-auto"
    aria-label="Better experience for pet parents"
  >
    <div className="px-6 md:px-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
      <div className="flex-1 w-full max-w-xl">
        <div className="w-full">
          <Image
            src="/images/experrience.jpg"
            alt="Pet parents spending time with their dog"
            className="w-full h-full "
            width={692}
            height={512}
          />
        </div>
      </div>
      <div className="flex-1 w-full sm:mt-8 ">
        <h2 className=" sm:text-[54px] text-[34px] font-[700] text-[#222] leading-tight">
          A Better Experience
          <br className="hidden md:block" /> for Pet Parents
        </h2>
        <div className="mt-[20px]">
          <article className="  sm:px-5 px-[0px] sm:py-4 py-[20px]">
            <div
              className="flex items-center justify-between gap-4 cursor-pointer"
              onClick={() =>
                setOpenIndex(openIndex === 0 ? null : 0)
              }
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-[8px] bg-[#111827] text-[14px] font-semibold text-white">
                  1
                </span>
                <span className="text-[20px] font-[600] text-[#111827]">
                  Skip the Hassle
                </span>
              </div>
              <span
                className="text-[24px] font-[500] text-[#222]"
                aria-hidden
              >
                {openIndex === 0 ? "−" : "+"}
              </span>
            </div>
            {openIndex === 0 && (
              <p className="mt-2 text-[14px] md:text-[15px] text-[#6B7280] leading-relaxed">
                Say goodbye to paper-based forms and the need to travel to
                town hall. Reduce the stress of government bureaucracy.
              </p>
            )}
          </article>

          <article className=" sm:px-5 px-[0px] sm:py-4 py-[20px] bg-white">
            <div
              className="flex items-center justify-between gap-4 cursor-pointer"
              onClick={() =>
                setOpenIndex(openIndex === 1 ? null : 1)
              }
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-[10px] bg-[#222] text-[14px] font-semibold text-[#fff]">
                  2
                </span>
                <span className="text-[20px] font-[600] text-[#222]">
                  Digital Vault
                </span>
              </div>
              <span
                className="text-[24px] font-[500] text-[#222]"
                aria-hidden
              >
                {openIndex === 1 ? "−" : "+"}
              </span>
            </div>
            {openIndex === 1 && (
              <p className="mt-2 text-[14px] md:text-[15px] text-[#6B7280] leading-relaxed">
                Store and access all your pet documents securely in one place,
                whenever you need them.
              </p>
            )}
          </article>

          <article className=" sm:px-5 px-[0px] sm:py-4 py-[20px] bg-white">
            <div
              className="flex items-center justify-between gap-4 cursor-pointer"
              onClick={() =>
                setOpenIndex(openIndex === 2 ? null : 2)
              }
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-[10px] bg-[#222] text-[14px] font-semibold text-[#fff]">
                  3
                </span>
                <span className="text-[20px] font-[600] text-[#222]">
                  All-in-One Hub
                </span>
              </div>
              <span
                className="text-[24px] font-[500] text-[#222]"
                aria-hidden
              >
                {openIndex === 2 ? "−" : "+"}
              </span>
            </div>
            {openIndex === 2 && (
              <p className="mt-2 text-[14px] md:text-[15px] text-[#6B7280] leading-relaxed">
                Manage registrations, reminders, and key pet information from a
                single, easy-to-use dashboard.
              </p>
            )}
          </article>
        </div>
      </div>
    </div>
  </section>
  );
}
