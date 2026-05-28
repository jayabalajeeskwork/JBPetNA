import { AuthHeader } from "@/components/AuthHeader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      {/* Background gradients */}
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[320px] w-[320px] rounded-full bg-[#C5E8EA]/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 -right-16 h-[280px] w-[280px] rounded-full bg-[#D4EEF0]/60 blur-3xl" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[24vw] bg-gradient-to-r from-[#EAF4F4] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[24vw] bg-gradient-to-l from-[#F3F6FA] to-transparent" />

      <AuthHeader />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </div>

      <footer className="relative z-10 mt-auto border-t border-[#E5E7EB] px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center justify-between gap-2 text-[12px] text-[#6B7280] sm:flex-row">
          <p>© 2025 GGIA Portal. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#111827]">
              Secure &amp; Private
            </a>
            <a href="#" className="hover:text-[#111827]">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#111827]">
              Support
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
