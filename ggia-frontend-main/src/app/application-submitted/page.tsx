import { ApplicationStatusCard } from "./ApplicationStatusCard";
import Link from "next/link";
import Image from "next/image";
export default function ApplicationSubmittedPage() {
  return (
    <main className=" ">
      {/* Header */}
      <header className="border-b border-[#EEE]">
        <div className="py-4 px-4 sm:px-6 lg:px-8 w-full mx-auto flex items-center justify-between max-w-[1440px]">
          <Link href="/">
            <Image src="/images/logo.svg" alt="Ggia" width={59} height={32} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[#627084]">
            <a
              href="#secure"
              className="hover:text-[#03838C] transition-colors"
            >
              Secure &amp; Private
            </a>
            <a
              href="#privacy"
              className="hover:text-[#03838C] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#support"
              className="hover:text-[#03838C] transition-colors"
            >
              Support
            </a>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center sm:pt-[80px] pt-[40px] ">
        <div className="w-full max-w-[644px]">
          <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
            <div className="mb-5">
              <div className="h-16 w-16 rounded-full bg-[#E0F7F4] flex items-center justify-center shadow-[0_12px_40px_rgba(3,131,140,0.18)]">
                <div className="h-9 w-9 rounded-full bg-[#03838C] flex items-center justify-center">
                  <span className="text-white text-3xl leading-none">✓</span>
                </div>
              </div>
            </div>

            <h1 className="text-[26px] sm:text-[38px] font-[700] text-[#07253A] mb-2">
              Application Submitted Successfully
            </h1>
            <p className="text-sm sm:text-[18px] text-[#657386]">
              Your pet licensing application has been processed.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#6b7f7c1a] px-[16px] py-[10px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <g clipPath="url(#clip0_564_938)">
                  <path
                    d="M10 0C12.6522 0 15.1957 1.05357 17.0711 2.92893C18.9464 4.8043 20 7.34784 20 10C20 12.6522 18.9464 15.1957 17.0711 17.0711C15.1957 18.9464 12.6522 20 10 20C7.34784 20 4.8043 18.9464 2.92893 17.0711C1.05357 15.1957 0 12.6522 0 10C0 7.34784 1.05357 4.8043 2.92893 2.92893C4.8043 1.05357 7.34784 0 10 0ZM9.0625 4.6875V10C9.0625 10.3125 9.21875 10.6055 9.48047 10.7812L13.2305 13.2812C13.6602 13.5703 14.2422 13.4531 14.5312 13.0195C14.8203 12.5859 14.7031 12.0078 14.2695 11.7188L10.9375 9.5V4.6875C10.9375 4.16797 10.5195 3.75 10 3.75C9.48047 3.75 9.0625 4.16797 9.0625 4.6875Z"
                    fill="#6B7F7C"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_564_938">
                    <path d="M0 0H20V20H0V0Z" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <p className="text-[14px] sm:text-[18px] text-[#6B7F7C]">
                Submitted on December 19, 2025 at 2:23 PM
              </p>
            </div>
          </div>

          <ApplicationStatusCard />
        </div>
      </div>

      <p className="text-[14px] text-[#657386] my-[40px] text-center">
        Need help? Contact support at{" "}
        <a
          href="mailto:support@ggia.com"
          className="text-[#14181F] font-medium underline block"
        >
          support@ggia.com
        </a>
      </p>
    </main>
  );
}
