"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SendAcknowledgementLinkDialog } from "@/app/groomer/dialog-box";

export function AuthHeader() {
  const [sendAcknowledgementOpen, setSendAcknowledgementOpen] = useState(false);

  return (
    <>
      <header className="relative z-10 border-b border-[#E5E7EB] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-10">
        <div className="mx-auto flex h-[72px] w-full max-w-[1240px] items-center justify-between">
          <Link href="/">
            <Image
              src="/images/logo.svg"
              alt="Ggia"
              width={59}
              height={32}
              priority
            />
          </Link>
          <Button
            type="button"
            onClick={() => setSendAcknowledgementOpen(true)}
            className="h-10 cursor-pointer rounded-[10px] bg-[#03838C] px-4 text-sm font-semibold text-white hover:bg-[#036D75] sm:h-11 sm:px-5 flex items-center gap-2"
          >
            <span className="hidden sm:inline">Send Acknowledgement Link</span>
            <span className="sm:hidden">Send Link</span>
            <Image
              src="/images/send.svg"
              alt="Send"
              width={16}
              height={16}
            />
          </Button>
        </div>
      </header>

      <SendAcknowledgementLinkDialog
        open={sendAcknowledgementOpen}
        onOpenChange={setSendAcknowledgementOpen}
        onLoginInstead={() => {
          setSendAcknowledgementOpen(false);
          // If already on login page, this might not be needed, 
          // but good to have for consistency with Navbar
        }}
      />
    </>
  );
}
