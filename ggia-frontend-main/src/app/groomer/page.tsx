import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function GroomerPage() {
  const intakeSteps = [
    {
      badge: "YOU",
      title: "Send Acknowledgment Link",
      description:
        "From your Ggia dashboard, send a secure link via SMS or Email.",
    },
    {
      badge: "Pet Owner",
      title: "Quick Owner Action",
      description:
        "Pet owners will be provided with the State Pet License Ordinance.",
    },
    {
      badge: "CHOICE",
      title: "Smart Options",
      description:
        "Upload existing license — or apply instantly if they don't have one. It will take less than 3 minutes.",
    },
    {
      badge: "SYSTEM",
      title: "Automatic Verification",
      description: "Ggia validates everything behind the scenes.",
    },
    {
      badge: "RESULT",
      title: "Ready for Service",
      description:
        "Your dashboard updates automatically / Once user clicks acknowledges.",
    },
  ];

  const intakeIcons = [
    <Image
      key="intake-icon-1"
      src="/images/s1.svg"
      alt="Intake Icon 1"
      width={26}
      height={26}
    />,
    <Image
      key="intake-icon-2"
      src="/images/s2.svg"
      alt="Intake Icon 2"
      width={26}
      height={26}
    />,
    <Image
      key="intake-icon-3"
      src="/images/s3.svg"
      alt="Intake Icon 3"
      width={26}
      height={26}
    />,
    <Image
      key="intake-icon-4"
      src="/images/s4.svg"
      alt="Intake Icon 4"
      width={26}
      height={26}
    />,
    <Image
      key="intake-icon-5"
      src="/images/s5.svg"
      alt="Intake Icon 5"
      width={26}
      height={26}
    />,
  ];

  const groomerHeroFeatures = [
    {
      id: "no-paperwork",
      title: "No Doorway Paperwork",
      description: "Requests are sent before the appointment.",
      iconSrc: "/images/admin1.svg",
    },
    {
      id: "live-visibility",
      title: "Live Compliance Visibility",
      description: "See exactly who's cleared — instantly.",
      iconSrc: "/images/admin2.svg",
    },
    {
      id: "one-click-reporting",
      title: "One-Click Reporting",
      description: "Submit municipality reports without spreadsheets.",
      iconSrc: "/images/admin3.svg",
    },
  ];

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <section className="flex-1 flex items-center justify-center sm:py-[100px] py-[40px]">
        <div className="max-w-[1440px] w-full mx-auto grid gap-10 lg:grid-cols-2 items-center sm:px-[40px] px-[20px]">
          {/* Left side: text content */}
          <div className="">
            <h1 className="text-[48px] sm:text-[74px] font-[700] sm:leading-[78px] leading-[60px] text-[#222]">
              Pet Service Compliance,
              <span className="block text-[#03838C]">Simplified.</span>
            </h1>
            <p className="text-[20px] sm:text-[20px] text-[16px] text-[#6A7181] max-w-[512px] mt-[10px]">
              Swiftly collect pet owner acknowledgment and submit compliance
              reports — without slowing down your day.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-[32px]">
              <Link
                href="/login"
                className="sm:px-[28px] px-[20px] sm:py-[12px] py-[10px] rounded-[8px] bg-[#03838C] border-2 border-[#03838C] text-white sm:text-[16px] text-[14px] font-[700] hover:opacity-90 transition-colors cursor-pointer"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="sm:px-[28px] px-[20px] sm:py-[12px] py-[10px] rounded-[8px] border-2 border-[#03838C] text-[#03838C] sm:text-[16px] text-[14px] font-[700] bg-white hover:bg-[#03838C] hover:text-white transition-colors cursor-pointer"
              >
                Create an Account
              </Link>
            </div>

            <div className="flex flex-wrap items-center sm:gap-[16px] gap-[10px]  mt-[32px]">
              {["Secure", "State-Compliant", "Customer-Friendly"].map(
                (label) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full  bg-[#EDF7F6] sm:px-[16px] px-[10px] sm:py-[8px] py-[6px] sm:text-[16px] text-[14px] font-medium text-[#03838C] "
                  >
                    <span className="inline-flex items-center justify-center">
                      {label === "Secure" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M13.3337 8.66664C13.3337 12 11.0003 13.6666 8.22699 14.6333C8.08177 14.6825 7.92402 14.6802 7.78033 14.6266C5.00033 13.6666 2.66699 12 2.66699 8.66664V3.99997C2.66699 3.82316 2.73723 3.65359 2.86225 3.52857C2.98728 3.40355 3.15685 3.33331 3.33366 3.33331C4.66699 3.33331 6.33366 2.53331 7.49366 1.51997C7.6349 1.39931 7.81456 1.33301 8.00033 1.33301C8.18609 1.33301 8.36576 1.39931 8.50699 1.51997C9.67366 2.53997 11.3337 3.33331 12.667 3.33331C12.8438 3.33331 13.0134 3.40355 13.1384 3.52857C13.2634 3.65359 13.3337 3.82316 13.3337 3.99997V8.66664Z"
                            stroke="#03838C"
                            strokeWidth="1.33333"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {label === "State-Compliant" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_306_570)">
                            <path
                              d="M14.5341 6.66666C14.8385 8.16086 14.6215 9.71428 13.9193 11.0679C13.2171 12.4214 12.072 13.4934 10.6751 14.1049C9.27816 14.7164 7.71382 14.8305 6.24293 14.4282C4.77205 14.026 3.48353 13.1316 2.59225 11.8943C1.70097 10.657 1.26081 9.15148 1.34518 7.62892C1.42954 6.10635 2.03332 4.65872 3.05583 3.52744C4.07835 2.39616 5.45779 1.64961 6.96411 1.4123C8.47043 1.17498 10.0126 1.46123 11.3334 2.22333"
                              stroke="#03838C"
                              strokeWidth="1.33333"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M6 7.33341L8 9.33341L14.6667 2.66675"
                              stroke="#03838C"
                              strokeWidth="1.33333"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_306_570">
                              <rect width="16" height="16" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      )}
                      {label === "Customer-Friendly" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M10.7404 2C13.0886 2 14.6663 4.235 14.6663 6.32C14.6663 10.5425 8.11819 14 7.99967 14C7.88116 14 1.33301 10.5425 1.33301 6.32C1.33301 4.235 2.91079 2 5.25893 2C6.60708 2 7.48856 2.6825 7.99967 3.2825C8.51079 2.6825 9.39227 2 10.7404 2Z"
                            stroke="#03838C"
                            strokeWidth="1.33"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span>{label}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Right side: hero image */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 -z-10 hidden sm:block">
              <div className="h-full w-full " />
            </div>
            <Image
              src="/images/groomer-hero.jpg"
              alt="Pet on exam table with provider"
              width={640}
              height={420}
              className="w-full h-auto "
            />
          </div>
        </div>
      </section>

      <section className="bg-[#EEF7F7] py-[40px] sm:py-[96px]">
        <div className="max-w-[1024px] w-full mx-auto sm:px-[40px] px-[20px]">
          <div className=" mx-auto text-center">
            <h2 className="text-[28px] sm:text-[48px] font-[700] text-[#222] sm:leading-[58px] leading-[34px]">
              Acknowledge Before Service
            </h2>
            <p className="text-[#353d42] text-[15px] font-medium">
              Pet owners must acknowledge of awareness of the State of New
              Jersey Pet License Law prior to service.{" "}
              <a href="#" className="text-[#17aaff]">
                Learn more
              </a>
            </p>
          </div>

          <div className="mt-[48px] relative">
            <div
              className="pointer-events-none absolute left-[24px] sm:left-[32px] top-0 bottom-[70px] w-[2px] bg-[#03838c38]"
              aria-hidden="true"
            />
            <div className="space-y-[24px]">
              {intakeSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-start sm:gap-[24px] gap-[16px]"
                >
                  <div className="relative z-10 flex items-center justify-center w-[50px] h-[50px] sm:w-[64px] sm:h-[64px] sm:rounded-[20px] rounded-[10px] bg-white">
                    {intakeIcons[index]}
                  </div>
                  <div className="flex-1 sm:rounded-[20px] rounded-[10px] bg-white sm:p-[24px] p-[16px]">
                    <p className="text-[11px] font-[700] tracking-[0.14em] text-[#03838C] uppercase">
                      {step.badge}
                    </p>
                    <h3 className="mt-[6px] text-[16px] sm:text-[18px] font-[700] text-[#1B3228]">
                      {step.title}
                    </h3>
                    <p className="mt-[2px] text-[13px] sm:text-[14px] font-[500] text-[#637780]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-[40px] sm:py-[96px]">
        <div className="max-w-[1200px] w-full mx-auto sm:px-[40px] px-[20px]">
          <div className="mx-auto max-w-[1000px] text-center">
            <h2 className="text-[32px] sm:text-[48px] font-[700] text-[#222] sm:leading-[68px] leading-[40px]">
              More Service. Less Administrative Work.
            </h2>
          </div>

          <div className="mt-[40px]">
            <div className="grid gap-[32px] lg:gap-[40px] lg:grid-cols-2 items-stretch ">
              <div className="relative">
                <Image
                  src="/images/Professional.jpg"
                  alt="Groomer working with a dog"
                  width={800}
                  height={520}
                  className="h-full w-full object-cover rounded-[24px]"
                />
              </div>

              <div className="flex flex-col justify-between sm:gap-[16px] gap-[10px] ">
                <div className="space-y-[20px]">
                  {groomerHeroFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center gap-[16px] sm:rounded-[20px] rounded-[10px] bg-[#FAFAFA] sm:p-[24px] p-[10px]"
                    >
                      <div className=" flex h-[50px] w-[50px] shrink-0 items-center justify-center sm:rounded-[12px] rounded-[8px] bg-[#03838c0d]">
                        <Image
                          src={feature.iconSrc}
                          alt={feature.title}
                          width={24}
                          height={24}
                        />
                      </div>
                      <div>
                        <h3 className="text-[15px] sm:text-[16px] font-[800] text-[#222] leading-[24px]">
                          {feature.title}
                        </h3>
                        <p className="mt-[0px] text-[13px] sm:text-[14px] font-[500] text-[#929292]">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="pt-[px] text-[13px] sm:text-[14px] font-[700] text-[#03838C]">
                  Built to match how groomers actually work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Streamline Your Daily Intake */}
      <section className="bg-[#E8F4F3] py-[40px] sm:py-[96px]">
        <div className="max-w-[1200px] w-full mx-auto sm:px-[40px] px-[20px]">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            {/* Left: heading + feature list */}
            <div>
              <h2 className="text-[32px] sm:text-[36px] font-[700] text-[#21282C] leading-tight">
                Streamline Your Daily Intake
              </h2>
              <ul className="mt-[32px] space-y-[24px]">
                <li className="flex gap-[16px]">
                  <span className="flex  shrink-0 items-start justify-center mt-[4px]">
                    <Image
                      src="/images/Component.svg"
                      alt="Intake Icon 1"
                      width={20}
                      height={20}
                    />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-[700] text-[#21282C] leading-[24px]">
                      Fast Intake Compliance
                    </h3>
                    <p className="mt-[4px] text-[14px] font-normal text-[#67777E] max-w-[400px] leading-[22px]">
                      Collect acknowledgments and Rabies documents digitally
                      before drop-off to keep lines moving.
                    </p>
                  </div>
                </li>
                <li className="flex gap-[16px]">
                  <span className="flex  shrink-0 items-start justify-center mt-[4px]">
                    <Image
                      src="/images/Component.svg"
                      alt="Intake Icon 1"
                      width={20}
                      height={20}
                    />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-[700] text-[#21282C] leading-[24px]">
                      Recurring Client Tracking
                    </h3>
                    <p className="mt-[4px] text-[14px] font-normal text-[#67777E] max-w-[400px] leading-[22px]">
                      Monitor license status for your regulars. Get alerts when
                      a license is about to expire.
                    </p>
                  </div>
                </li>
                <li className="flex gap-[16px]">
                  <span className="flex  shrink-0 items-start justify-center mt-[4px]">
                    <Image
                      src="/images/Component.svg"
                      alt="Intake Icon 1"
                      width={20}
                      height={20}
                    />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-[700] text-[#21282C]  leading-[24px]">
                      Audit-Ready Records
                    </h3>
                    <p className="mt-[4px] text-[14px] font-normal text-[#67777E] max-w-[400px] leading-[22px]">
                      Export detailed logs instantly for state inspections or
                      internal audits.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right: pet profiles card */}
            <div className="rounded-[20px] bg-[#fff] p-[16px] sm:p-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-4 mb-2 px-[16px]">
                <div></div>
                <div className="text-[14px] font-[500] text-gray-500 text-center">
                  Proof of rabies
                </div>
                <div className="text-[14px] font-[500] text-gray-500 text-center">
                  Acknowledgement
                </div>
              </div>
              <div className="space-y-[16px]">
                <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center rounded-[12px] bg-[#03838c0d] px-[16px] py-[14px]">
                  <span className="text-[14px] sm:text-[15px] font-[500] text-[#21282C]">
                    Bella - Golden Retriever
                  </span>
                  <div className="flex justify-center items-center gap-2">
                    <span className="rounded-full bg-[#36A162] px-[12px] py-[4px] text-[12px] font-[600] text-white min-w-[80px] text-center">
                      Uploaded
                    </span>
                    <span className="text-[#6B7280] text-[12px] font-[400] cursor-pointer hover:underline">
                      view
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <span className="rounded-full bg-[#03838C] px-[12px] py-[4px] text-[12px] font-[600] text-white min-w-[80px] text-center">
                      Verified
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center rounded-[12px] bg-[#03838c0d] px-[16px] py-[14px]">
                  <span className="text-[14px] sm:text-[15px] font-[600] text-[#222]">
                    Max - Labrador
                  </span>
                  <div className="flex justify-center">
                    <span className="rounded-full bg-[#fff] border border-[#E2E7E9] px-[12px] py-[4px] text-[12px] font-[600] text-[#67777E] min-w-[80px] text-center">
                      Pending
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <span className="rounded-full bg-[#36A162] px-[12px] py-[4px] text-[12px] font-[600] text-white min-w-[80px] text-center">
                      Ready
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center rounded-[12px] bg-[#F9F5F1] px-[16px] py-[14px]">
                  <span className="text-[14px] sm:text-[15px] font-[600] text-[#222]">
                    Rocky - Bulldog
                  </span>
                  <div className="flex justify-center">
                    <span className="rounded-full bg-[#fff] border border-[#E2E7E9] px-[12px] py-[4px] text-[12px] font-[600] text-[#67777E] min-w-[80px] text-center">
                      Pending
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <span className="rounded-full bg-[#fff] border border-[#E2E7E9] px-[12px] py-[4px] text-[12px] font-[600] text-[#67777E] min-w-[80px] text-center">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#ffffff] py-[40px] sm:py-[96px]">
        <div className="max-w-[1200px] mx-auto px-[16px] sm:px-[24px]">
          <h2 className="text-center text-[30px] sm:text-[48px] font-[700] leading-[48px] text-[#222] sm:leading-[68px] leading-[28px]">
            Compliance in Three Simple Steps
          </h2>

          <div className="mt-[20px] sm:mt-[56px] flex flex-col md:flex-row gap-[32px] md:gap-[46px] items-stretch">
            {/* Left: placeholder panel */}
            <div className="flex-1 mt-[20px]">
              <Image
                src="/images/Compliance.jpg"
                alt="Step 1"
                width={833}
                height={545}
                className="w-full h-full rounded-[6px] "
              />
            </div>

            {/* Right: numbered steps */}
            <div className="flex-1 flex flex-col sm:gap-[0px] gap-[26px] ">
              <div className="">
                <span className="text-[38px] sm:text-[64px] font-[700] sm:leading-[96px] leading-[46px] text-[#222]">
                  01
                </span>
                <div>
                  <h3 className="text-[16px] sm:text-[20px] font-[800] leading-[28px] text-[#1B3228]">
                    Send the Link
                  </h3>
                  <p className="mt-[6px] text-[14px] sm:text-[15px] leading-[22px] text-[#67777E] font-[800]">
                    Enter your client&apos;s contact info. We send them a secure
                    link via SMS/Email.
                  </p>
                </div>
              </div>

              <div className="">
                <span className="text-[38px] sm:text-[64px] font-[700] sm:leading-[96px] leading-[46px] text-[#222]">
                  02
                </span>
                <div>
                  <h3 className="text-[16px] sm:text-[20px] font-[800] leading-[28px] text-[#1B3228]">
                    Client Action
                  </h3>
                  <p className="mt-[6px] text-[14px] sm:text-[15px] leading-[22px] text-[#67777E]  font-[800]">
                    The client confirms their license status or immediately
                    requests a license.
                  </p>
                </div>
              </div>

              <div className="">
                <span className="text-[38px] sm:text-[64px] font-[700] sm:leading-[96px] leading-[46px] text-[#222]">
                  03
                </span>
                <div>
                  <h3 className="text-[16px] sm:text-[20px] font-[800] leading-[28px] text-[#1B3228]">
                    Auto-Reporting
                  </h3>
                  <p className="mt-[6px] text-[14px] sm:text-[15px] leading-[22px] text-[#67777E]  font-[800]">
                    Your dashboard automatically tracks compliance. Submit your
                    monthly report to the State with single click. 
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
