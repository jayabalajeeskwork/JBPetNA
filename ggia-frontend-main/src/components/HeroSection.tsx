"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  return (
    <>
    {/* Hero: Protect Your Best Friend */}
    <section className="relative bg-white py-6 md:py-16 lg:py-20">
    <div className="absolute left-0 bottom-[30px] z-10  ">
      <Image src="/images/foot2.svg" alt="Hero background"  width={111} height={111} className=" w-[50%] h-[50%]" />
    </div>
    <div className="absolute right-0 top-0  z-10 ">
      <Image src="/images/foot1.svg" alt="Hero background"  width={141} height={141} className=" hidden sm:block" />
    </div>
    <div
    className="w-full  relative max-w-[1440px] mx-auto "
    aria-label="Pet licensing hero"
  >
  
    <div className=" mx-auto  flex flex-col lg:flex-row items-center gap-10 lg:gap-16 sm:px-[40px] px-[20px]">
      {/* Left: Copy + CTA */}
      <div className="flex-1 text-left  ">
        <h1 className="sm:text-[64px] text-[40px] font-bold text-[#222] leading-tight">
          Protect Your Best Friend.
          Comply with the <span className="text-[#03838C]">Law.</span>
        </h1>
        <p className="mt-[12px] text-[20px]  text-[#6A7181] ">
          The easiest way to license your pet and keep them safe. No more
          trips to Town Hall.
        </p>
        <div className="mt-[16px]">
          <button
            type="button"
            onClick={() => router.push("/acknowledgement")}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-[#03838C] hover:opacity-90 text-white font-medium rounded-[8px] transition-opacity cursor-pointer"
            aria-label="Register my pet now"
          >
            Register My Pet Now
          </button>
        </div>
        <div className="mt-[24px] flex items-center gap-[10px] text-[14px] text-[#222] font-[600]">
          <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M13.3332 8.66664C13.3332 12 10.9998 13.6666 8.2265 14.6333C8.08128 14.6825 7.92353 14.6802 7.77984 14.6266C4.99984 13.6666 2.6665 12 2.6665 8.66664V3.99997C2.6665 3.82316 2.73674 3.65359 2.86177 3.52857C2.98679 3.40355 3.15636 3.33331 3.33317 3.33331C4.6665 3.33331 6.33317 2.53331 7.49317 1.51997C7.63441 1.39931 7.81407 1.33301 7.99984 1.33301C8.1856 1.33301 8.36527 1.39931 8.5065 1.51997C9.67317 2.53997 11.3332 3.33331 12.6665 3.33331C12.8433 3.33331 13.0129 3.40355 13.1379 3.52857C13.2629 3.65359 13.3332 3.82316 13.3332 3.99997V8.66664Z" stroke="#03838C" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
            Secure
          </span>
          <span className="text-[#03838C]" aria-hidden>
            •
          </span>
          <span className="flex items-center gap-[10px] text-[#222] font-[600] text-[14px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<g clipPath="url(#clip0_266_20814)">
<path d="M14.5341 6.66666C14.8385 8.16086 14.6215 9.71428 13.9193 11.0679C13.2171 12.4214 12.072 13.4934 10.6751 14.1049C9.27816 14.7164 7.71382 14.8305 6.24293 14.4282C4.77205 14.026 3.48353 13.1316 2.59225 11.8943C1.70097 10.657 1.26081 9.15148 1.34518 7.62892C1.42954 6.10635 2.03332 4.65872 3.05583 3.52744C4.07835 2.39616 5.45779 1.64961 6.96411 1.4123C8.47043 1.17498 10.0126 1.46123 11.3334 2.22333" stroke="#03838C" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M6 7.33366L8 9.33366L14.6667 2.66699" stroke="#03838C" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
</g>
<defs>
<clipPath id="clip0_266_20814">
  <rect width="16" height="16" fill="white"/>
</clipPath>
</defs>
</svg>
            Municipality Approved
          </span>
        </div>
      </div>
      {/* Right: Dog image with teal circle frame (partial circle off right edge) */}
      <div className="flex-1 w-full max-w-lg order-1 lg:order-2 relative flex justify-center lg:justify-end overflow-hidden">
        <div className="relative w-full max-w-[420px] aspect-[4/3]">
        
          <img
            src="/images/hero.jpg"
            alt="Happy dog"
            className=""
          />
        </div>
      </div>
    </div>
  </div>
  </section>
  </>
  );
}
