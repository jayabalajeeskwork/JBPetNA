import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ggia – Pet Registration Made Easy",
  description:
    "The easiest way to license your pet and keep them safe. Register online – no more trips to Town Hall.",
  keywords: ["pet registration", "dog license", "cat registration", "animal license", "municipality pet"],
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
