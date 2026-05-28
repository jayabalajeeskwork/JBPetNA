"use client";

import { useState } from "react";

export default function SearchPets() {
  const [activeTab, setActiveTab] = useState<"find" | "lost">("find");
  return (
    <section className="bg-white sm:py-12 py-[50px]">
      <div className="max-w-[768px] mx-auto sm:px-6 px-[20px]">
        <div className="bg-white border border-[#C2C2C2] rounded-[24px]">
          {/* Tabs */}
          <div className="sm:pt-5 pt-[20px] border-b border-[#C2C2C2] w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-8 w-full justify-between">
                {/* Active tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab("find")}
                  className={`relative pb-3 sm:px-[110px] px-[20px] cursor-pointer flex items-center gap-2 sm:text-[16px] text-[14px] font-[500]  cursor-pointer ${
                    activeTab === "find" ? "text-[#03838C]" : "text-[#6A7181]"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                      stroke="#03838C"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 14L11.1333 11.1333"
                      stroke="#03838C"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Found a Pet ?</span>
                  {activeTab === "find" && (
                    <span className="absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-[#03838C] min-w-[full]" />
                  )}
                </button>

                {/* Inactive tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab("lost")}
                  className={`relative pb-3 sm:px-[110px] px-[20px] cursor-pointer flex items-center gap-2 sm:text-[16px] text-[14px] font-medium ${
                    activeTab === "lost" ? "text-[#03838C]" : "text-[#6A7181]"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_350_141)">
                      <path
                        d="M7.5 10.8335H8.5L8 11.3335L7.5 10.8335Z"
                        stroke="#6A7181"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.6665 9.3335V9.66683"
                        stroke="#6A7181"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.94651 7.49805C2.75993 8.21852 2.66584 8.95981 2.66651 9.70405C2.66651 12.4854 5.05451 14 7.99984 14C10.9452 14 13.3332 12.4854 13.3332 9.70405C13.3298 8.95677 13.2192 8.21384 13.0045 7.49805"
                        stroke="#6A7181"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.3335 9.3335V9.66683"
                        stroke="#6A7181"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.66665 5.66681C5.41065 6.36681 4.94465 7.01881 4.10399 7.33348C2.81665 7.81481 1.71999 7.13548 1.66665 6.66681C1.59132 6.00414 2.45132 2.31348 4.33332 2.00014C5.61532 1.78614 6.76732 2.56348 6.76732 3.49014C7.61051 3.27599 8.495 3.28565 9.33332 3.51814C9.33332 2.59148 10.5627 1.78614 11.8447 2.00014C13.7267 2.31348 14.5867 6.00414 14.5113 6.66681C14.458 7.13548 13.3613 7.81481 12.074 7.33348C11.2333 7.01881 10.8373 6.36681 10.5813 5.66681"
                        stroke="#6A7181"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_350_141">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <span>Lost a Pet ?</span>
                  {activeTab === "lost" && (
                    <span className="absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-[#03838C]" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="sm:p-[32px] p-[20px] space-y-6">
            {/* Address row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div>
                <input
                  type="text"
                  placeholder="Street Address"
                  className="h-[40px] w-full rounded-[8px] border border-[#C2C2C2] px-3 text-[14px] font-[400] leading-[20px] placeholder:text-[#6A7181] focus:border-[#03838C] focus:outline-none focus:ring-2 focus:ring-[#03838C33]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City"
                  className="h-[40px] w-full rounded-[8px] border border-[#C2C2C2] px-3 text-[14px] font-[400] leading-[20px] placeholder:text-[#6A7181] focus:border-[#03838C] focus:outline-none focus:ring-2 focus:ring-[#03838C33]"
                />
              </div>
            </div>

            {/* Zip / Distance / Pet type */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-[16px]">
              <div className="md:col-span-4">
                <input
                  type="text"
                  placeholder="Zip Code"
                  className="h-[40px] w-full rounded-[8px] border border-[#C2C2C2] px-3 text-[14px] font-[400] leading-[20px] placeholder:text-[#6A7181] focus:border-[#03838C] focus:outline-none focus:ring-2 focus:ring-[#03838C33]"
                />
              </div>
              <div className="md:col-span-4">
                <input
                  type="text"
                  placeholder="5 miles"
                  className="h-[40px] w-full rounded-[8px] border border-[#C2C2C2] px-3 text-[14px] font-[400] leading-[20px] placeholder:text-[#6A7181] focus:border-[#03838C] focus:outline-none focus:ring-2 focus:ring-[#03838C33]"
                />
              </div>
              <button
                type="button"
                className="md:col-span-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-[#C2C2C2] bg-white px-4 h-[40px] text-[14px] font-[400] leading-[20px] text-[#111827] w-full"
              >
                <span className="text-lg" aria-hidden>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M7.5 10.8335H8.5L8 11.3335L7.5 10.8335Z"
                      stroke="#6A7181"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.6665 9.3335V9.66683"
                      stroke="#6A7181"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2.94651 7.49805C2.75993 8.21852 2.66584 8.95981 2.66651 9.70405C2.66651 12.4854 5.05451 14 7.99984 14C10.9452 14 13.3332 12.4854 13.3332 9.70405C13.3298 8.95677 13.2192 8.21384 13.0045 7.49805"
                      stroke="#6A7181"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.3335 9.3335V9.66683"
                      stroke="#6A7181"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.66665 5.66681C5.41065 6.36681 4.94465 7.01881 4.10399 7.33348C2.81665 7.81481 1.71999 7.13548 1.66665 6.66681C1.59132 6.00414 2.45132 2.31348 4.33332 2.00014C5.61532 1.78614 6.76732 2.56348 6.76732 3.49014C7.61051 3.27599 8.495 3.28565 9.33332 3.51814C9.33332 2.59148 10.5627 1.78614 11.8447 2.00014C13.7267 2.31348 14.5867 6.00414 14.5113 6.66681C14.458 7.13548 13.3613 7.81481 12.074 7.33348C11.2333 7.01881 10.8373 6.36681 10.5813 5.66681"
                      stroke="#6A7181"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>Dog</span>
              </button>
              <button
                type="button"
                className="md:col-span-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-[#C2C2C2] bg-white px-4 h-[40px] text-[14px] font-[400] leading-[20px] text-[#111827] w-full"
              >
                <span className="text-lg" aria-hidden>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M8.00005 3.33351C8.44672 3.33351 8.90005 3.39351 9.33339 3.50684C10.5201 2.17351 12.6867 1.61351 13.6134 2.00018C14.5467 2.38684 13.3334 6.66684 13.3334 6.66684C13.7134 7.38018 14.0001 8.16018 14.0001 8.96018C14.0001 11.9335 11.3134 14.0002 8.00005 14.0002C4.68672 14.0002 2.00005 12.0002 2.00005 8.96018C2.00005 8.12684 2.33339 7.36018 2.66672 6.66684C2.66672 6.66684 1.40672 2.38684 2.33339 2.00018C3.26005 1.61351 5.48005 2.15351 6.66672 3.48684C7.10407 3.38625 7.55129 3.33482 8.00005 3.33351Z"
                      stroke="#6A7181"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.3335 9.3335V9.66683"
                      stroke="#6A7181"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.6665 9.3335V9.66683"
                      stroke="#6A7181"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7.5 10.8335H8.5L8 11.3335L7.5 10.8335Z"
                      stroke="#6A7181"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>Cat</span>
              </button>
            </div>

            {/* AI card */}
            <div className="rounded-[16px] border border-[#03838C] bg-[#fff] p-[20px]">
              <div className="flex items-start gap-3">
                <div className="items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_266_20955)">
                      <path
                        d="M8.28086 12.9167C8.20647 12.6283 8.05615 12.3651 7.84555 12.1545C7.63494 11.9439 7.37176 11.7936 7.08336 11.7192L1.97086 10.4009C1.88364 10.3761 1.80687 10.3236 1.75221 10.2512C1.69754 10.1789 1.66797 10.0907 1.66797 10C1.66797 9.90937 1.69754 9.82118 1.75221 9.74884C1.80687 9.6765 1.88364 9.62397 1.97086 9.59921L7.08336 8.28004C7.37166 8.20572 7.63477 8.05552 7.84537 7.84508C8.05596 7.63463 8.20634 7.37162 8.28086 7.08338L9.5992 1.97088C9.6237 1.88331 9.67618 1.80616 9.74863 1.75121C9.82108 1.69625 9.90951 1.6665 10.0004 1.6665C10.0914 1.6665 10.1798 1.69625 10.2523 1.75121C10.3247 1.80616 10.3772 1.88331 10.4017 1.97088L11.7192 7.08338C11.7936 7.37177 11.9439 7.63496 12.1545 7.84556C12.3651 8.05616 12.6283 8.20648 12.9167 8.28088L18.0292 9.59838C18.1171 9.62263 18.1946 9.67505 18.2499 9.74761C18.3052 9.82016 18.3351 9.90884 18.3351 10C18.3351 10.0912 18.3052 10.1799 18.2499 10.2525C18.1946 10.325 18.1171 10.3775 18.0292 10.4017L12.9167 11.7192C12.6283 11.7936 12.3651 11.9439 12.1545 12.1545C11.9439 12.3651 11.7936 12.6283 11.7192 12.9167L10.4009 18.0292C10.3764 18.1168 10.3239 18.1939 10.2514 18.2489C10.179 18.3038 10.0905 18.3336 9.99961 18.3336C9.90868 18.3336 9.82025 18.3038 9.7478 18.2489C9.67535 18.1939 9.62287 18.1168 9.59836 18.0292L8.28086 12.9167Z"
                        stroke="#03838C"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16.6665 2.5V5.83333"
                        stroke="#03838C"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.3333 4.1665H15"
                        stroke="#03838C"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.3335 14.1665V15.8332"
                        stroke="#03838C"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.16667 15H2.5"
                        stroke="#03838C"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_266_20955">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h3 className="text-[16px] font-[700] text-[#222]">
                    AI-Assisted Identification
                  </h3>
                </div>
              </div>
              <p className="mt-[10px] text-[14px] font-[400] leading-[20px] text-[#6A7181]">
                Upload a pet photo and our AI will match via facial recognition
                for pets.
              </p>
              <div className="mt-[12px]">
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#03838C] px-5 h-[40px] text-[14px] font-[500] text-white hover:opacity-90"
                >
                  <span className="">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="12"
                      viewBox="0 0 15 12"
                      fill="none"
                    >
                      <path
                        d="M8.99984 0.666504H5.6665L3.99984 2.6665H1.99984C1.64622 2.6665 1.30708 2.80698 1.05703 3.05703C0.80698 3.30708 0.666504 3.64622 0.666504 3.99984V9.99984C0.666504 10.3535 0.80698 10.6926 1.05703 10.9426C1.30708 11.1927 1.64622 11.3332 1.99984 11.3332H12.6665C13.0201 11.3332 13.3593 11.1927 13.6093 10.9426C13.8594 10.6926 13.9998 10.3535 13.9998 9.99984V3.99984C13.9998 3.64622 13.8594 3.30708 13.6093 3.05703C13.3593 2.80698 13.0201 2.6665 12.6665 2.6665H10.6665L8.99984 0.666504Z"
                        stroke="white"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            {/* Search button and footer text */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#03838C] px-6 py-3 text-[16px] font-[500]  text-white hover:opacity-90 cursor-pointer"
              >
                <span>Submit</span>
              </button>
              <p className="text-[12px] text-center text-[#6A7181]">
                Verified registration helps groomers and daycares stay compliant
                and protects the community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
