import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1440px] mx-auto  sm:py-8 py-[30px] sm:px-[40px] px-[20px] sm:pb-4 pb-[10px]">
        <div className="border-b border-white/20 flex items-center justify-between sm:flex-nowrap flex-wrap sm:pb-8 pb-[20px]">
        <div className="">
          <Image src="/images/footer-logo.svg" alt="Ggia" width={59} height={32} />
        </div>

        <nav className="flex items-center sm:flex-nowrap flex-wrap sm:gap-x-10 gap-x-[20px] mt-4 sm:mt-0 sm:text-[14px] text-[12px] font-[500] ">
          <a
            href="#groomer-login"
            className="hover:text-white/70 transition-colors"
          >
            Groomer Login
          </a>
          <a
            href="#vet-login"
            className="hover:text-white/70 transition-colors"
          >
            Vet Login
          </a>
          <a
            href="#municipal-login"
            className="hover:text-white/70 transition-colors"
          >
            Municipal Login
          </a>
          <a
            href="#support"
            className="hover:text-white/70 transition-colors"
          >
            Support
          </a>
        </nav>
        </div>
      </div>

     
<div className="">
      <div className="max-w-[1440px] mx-auto  py-4  text-center  ">
        <p className="text-[12px] font-[500]  text-white">
          &copy; 2026 Ggia. All rights reserved.
        </p>
      </div>
      </div>
    </footer>
  );
}
