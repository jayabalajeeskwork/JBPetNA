"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/stores/useStore";
import Link from "next/link";

export function DashboardHeader() {
  const router = useRouter();
  const { logout, authLoading, setAcknowledgementSheetOpen } = useStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-[100%] items-center justify-between gap-4 px-4 py-4 md:px-6 ">
        <Link href="/dashboard" className="text-xl font-semibold tracking-tight text-teal-600">
          Ggia
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            className="gap-[.6rem] !px-[1.2rem] cursor-pointer !py-[.6rem] h-auto rounded-[12px] bg-[#03838C] text-white text-[16px] font-[600] leading-[20px] hover:bg-teal-700"
            size="default"
            onClick={() => setAcknowledgementSheetOpen(true)}
          >
            Send Acknowledgement Link
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M3.61133 1.64648C3.99126 1.60105 4.37655 1.66669 4.71973 1.83594L17.75 8.22949H17.751C18.0813 8.39258 18.3592 8.64518 18.5537 8.95801C18.7482 9.27096 18.8516 9.63251 18.8516 10.001C18.8515 10.3693 18.7481 10.7301 18.5537 11.043C18.3593 11.3558 18.0812 11.6084 17.751 11.7715H17.75L4.71875 18.166C4.44666 18.3002 4.14714 18.3693 3.84375 18.3691C3.53794 18.3688 3.23644 18.2978 2.96289 18.1611C2.68929 18.0244 2.45141 17.8255 2.26758 17.5811C2.08389 17.3367 1.95878 17.0535 1.90332 16.7529C1.84789 16.4521 1.86362 16.1416 1.94824 15.8477L3.64551 10L1.94824 4.15332C1.84246 3.78562 1.84505 3.39516 1.95703 3.0293C2.06908 2.66337 2.2855 2.33727 2.5791 2.0918C2.87264 1.84647 3.23147 1.69194 3.61133 1.64648ZM3.84961 3.10742C3.72688 3.10901 3.60894 3.15363 3.51562 3.2334C3.4417 3.29673 3.38611 3.37897 3.35645 3.47168C3.32713 3.56336 3.32409 3.66136 3.34668 3.75488L4.91992 9.27539H10C10.1923 9.27539 10.3767 9.35232 10.5127 9.48828C10.6487 9.62424 10.7256 9.8087 10.7256 10.001C10.7255 10.1932 10.6486 10.3777 10.5127 10.5137C10.3767 10.6495 10.1922 10.7256 10 10.7256H4.91992L3.34668 16.2783C3.32731 16.3721 3.33423 16.4692 3.36621 16.5596C3.39887 16.6518 3.45582 16.7338 3.53223 16.7949C3.60867 16.8561 3.70162 16.8946 3.79883 16.9062C3.89588 16.9178 3.99445 16.9017 4.08301 16.8604L17.1064 10.4736L17.1699 10.4365C17.231 10.3956 17.2829 10.3421 17.3223 10.2793C17.3746 10.1958 17.4023 10.0995 17.4023 10.001C17.4023 9.90235 17.3746 9.80525 17.3223 9.72168C17.283 9.65912 17.2308 9.60629 17.1699 9.56543L17.1064 9.52832L4.08105 3.16602L4.0791 3.16504C4.00793 3.12859 3.92955 3.10889 3.84961 3.10742Z"
                fill="white"
                stroke="white"
                strokeWidth="0.2"
              />
            </svg>
          </Button>

          <Select
            defaultValue="paw-palace"
            onValueChange={(val) => {
              if (val === "logout") handleLogout();
            }}
          >
            <SelectTrigger className="h-10 w-[260px] rounded-[12px] border-input bg-background shadow-xs font-[600] cursor-pointer focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <Image
                  src="/images/paw.svg"
                  alt="Paw Palace"
                  width={24}
                  height={24}
                />
                <SelectValue placeholder="Select account" />
              </span>
            </SelectTrigger>
            <SelectContent className="rounded-[12px] border border-[#E5E7EB] bg-white text-[16px] !font-[600] text-[#14181F]">
              <SelectItem
                value="paw-palace"
                className="cursor-pointer !font-[600] hover:bg-[#F3F4F6] hover:text-[#14181F]"
              >
                Paw Palace Grooming
              </SelectItem>
              <SelectItem
                value="logout"
                className="cursor-pointer !font-[600] text-red-500 hover:!bg-red-50 hover:!text-red-600"
              >
                <div className="flex items-center gap-2">
                  {authLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Logout
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
