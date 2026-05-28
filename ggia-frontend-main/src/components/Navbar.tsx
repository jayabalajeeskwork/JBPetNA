"use client";

import { SendAcknowledgementLinkDialog } from "@/app/groomer/dialog-box";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

import Link from "next/link";

const navLinks = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#find-lost-pet", label: "Find / Lost a Pet" },
  { href: "#why-registration", label: "Why Registration Matters" },
  { href: "#groomers-daycares", label: "For Groomers & Daycares" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sendAcknowledgementOpen, setSendAcknowledgementOpen] = useState(false);
  const pathname = usePathname();
  const isGroomerPage = pathname === "/groomer";

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="bg-white flex flex-col border-b border-[#EEE] py-3">
      <header
        className="w-full bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white shadow-[0_4px_86.6px_0_rgba(231,231,231,0.25)] max-w-[1440px] mx-auto"
        role="banner"
      >
        <div className="flex-shrink-0">
          <Link href="/">
            <Image src="/images/logo.svg" alt="Ggia" width={59} height={32} />
          </Link>
        </div>

        {/* Desktop nav — hidden on small screens */}
        <nav
          className="hidden lg:flex items-center gap-x-6 flex-1 justify-center"
          aria-label="Main navigation"
        >
          {navLinks
            .filter(
              (link) => !isGroomerPage || link.label !== "Find / Lost a Pet",
            )
            .map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-[14px] text-[#627084] font-medium hover:text-teal-500 transition-colors"
                tabIndex={0}
              >
                {label}
              </a>
            ))}
        </nav>
        {isGroomerPage && (
          <Link
            href="/login"
            className="text-[14px] text-[#627084] font-medium hover:text-teal-500 transition-colors mr-4"
          >
            Dashboard
          </Link>
        )}
        {/* Desktop CTA — hidden on small screens and on groomer page */}
        {!isGroomerPage && (
          <div className="hidden lg:block flex-shrink-0">
            <button
              type="button"
              onClick={() => router.push("/acknowledgement")}
              className="px-[18px] py-[8px] cursor-pointer text-[16px] font-[600] leading-[20px] bg-[#03838C] hover:bg-[#03838C] text-white font-medium rounded-[8px] transition-colors"
              aria-label="Get a Pet License"
            >
              Get a Pet License
            </button>
          </div>
        )}

        {isGroomerPage && (
          <button
            type="button"
            className="hidden lg:flex px-[10px] py-[8px] cursor-pointer text-[16px] font-[600] leading-[20px] bg-[#03838C] hover:bg-[#03838C] text-white font-medium rounded-[8px] transition-colors items-center gap-2"
            aria-label="Send acknowledgement link"
            onClick={() => setSendAcknowledgementOpen(true)}
          >
            Send Acknowledgement Link{" "}
            <span>
              <Image src="/images/send.svg" alt="" width={20} height={20} />
            </span>
          </button>
        )}

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden flex-shrink-0 sm:p-2 p-[6px] -mr-2 text-[#627084] hover:text-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-[8px]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile dropdown menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-200 ease-out ${
          mobileMenuOpen
            ? "max-h-[400px] mt-[10px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav
          className="px-4 sm:px-6 pb-4 pt-2 bg-white border-t border-[#EEE] flex flex-col gap-1"
          aria-label="Main navigation"
        >
          {navLinks
            .filter(
              (link) => !isGroomerPage || link.label !== "Find / Lost a Pet",
            )
            .map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={closeMenu}
                className="py-3 px-2 text-[14px] text-[#627084] font-medium hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                {label}
              </a>
            ))}
          {isGroomerPage && (
            <div className="pt-2 mt-2 border-t border-[#EEE]">
              <button
                type="button"
                onClick={() => {
                  setSendAcknowledgementOpen(true);
                  closeMenu();
                }}
                className="w-full py-3 px-4 cursor-pointer text-[16px] font-[600] leading-[20px] bg-[#03838C] hover:bg-[#03838C] text-white font-medium rounded-[8px] transition-colors flex items-center justify-center gap-2"
                aria-label="Send acknowledgement link"
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                Send Acknowledgement Link{" "}
                <Image src="/images/send.svg" alt="" width={20} height={20} />
              </button>
            </div>
          )}
          {!isGroomerPage && (
            <div className="pt-2 mt-2 border-t border-[#EEE]">
              <button
                type="button"
                onClick={() => {
                  router.push("/acknowledgement");
                  closeMenu();
                }}
                className="w-full py-3 px-4 cursor-pointer text-[16px] font-[600] leading-[20px] bg-[#03838C] hover:bg-[#03838C] text-white font-medium rounded-[8px] transition-colors"
                aria-label="Get a Pet License"
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                Get a Pet License
              </button>
            </div>
          )}
        </nav>
      </div>

      <SendAcknowledgementLinkDialog
        open={sendAcknowledgementOpen}
        onOpenChange={setSendAcknowledgementOpen}
        onLoginInstead={() => {
          router.push("/login");
        }}
      />
    </div>
  );
}
