"use client";

import React, { useEffect, useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { SendAcknowledgementLinkSheet } from "./send-acknowledgement-link";
import { useStore } from "@/stores/useStore";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const {
    isAcknowledgementSheetOpen,
    setAcknowledgementSheetOpen,
    linkVia,
    setLinkVia,
    petType,
    setPetType,
    isAuthenticated,
  } = useStore();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const user = localStorage.getItem("user");

    // If no token or user data, redirect to login
    if (!token || !user) {
      router.replace("/login");
    } else {
      setIsChecking(false);
    }
  }, [router, isAuthenticated]);

  // Prevent flashing of protected content while checking authentication
  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col w-full">
      <DashboardHeader />

      {children}

      <SendAcknowledgementLinkSheet
        open={isAcknowledgementSheetOpen}
        onOpenChange={setAcknowledgementSheetOpen}
        linkVia={linkVia}
        setLinkVia={setLinkVia}
        petType={petType}
        setPetType={setPetType}
      />
    </div>
  );
}
