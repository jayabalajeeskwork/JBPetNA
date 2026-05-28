import Image from "next/image";
export default function PetRegistrationSection() {
  return (
    <>
      <div>
        <Image
          src="/images/shape1.svg"
          alt="Pet Registration"
          width={100}
          height={100}
          className="w-full"
        />
      </div>
      <section
        className="w-full bg-[#e7f4f4]  "
        aria-label="What is Pet Registration"
      >
        <div className="text-center  mx-auto max-w-[1440px] sm:px-6 px-[20px]">
          <h2 className="sm:text-[54px] text-[40px] font-[700] text-[#222] leading-tight">
            What is a Pet License?
          </h2>
          <p className="sm:text-[20px] text-[16px] sm:mt-0 mt-[12px] text-[#6A7181]">
            State law requires all dogs 7 months or older to be licensed by the
            municipality they reside in.
          </p>
        </div>
        <div className="mt-[39px] grid grid-cols-1 md:grid-cols-3 gap-[32px] max-w-[1440px] mx-auto sm:px-[40px] px-[20px]">
          {/* Faster Reunions */}
          <article className="bg-white rounded-[28px] sm:p-[32px] p-[20px] ">
            <div
              className="w-[56px] h-[56px] rounded-[12px] bg-[#DBEDEE] flex items-center justify-center "
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
              >
                <path
                  d="M12.8333 6.99967C14.122 6.99967 15.1667 5.95501 15.1667 4.66634C15.1667 3.37768 14.122 2.33301 12.8333 2.33301C11.5447 2.33301 10.5 3.37768 10.5 4.66634C10.5 5.95501 11.5447 6.99967 12.8333 6.99967Z"
                  stroke="#03838C"
                  strokeWidth="2.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20.9998 11.6667C22.2885 11.6667 23.3332 10.622 23.3332 9.33333C23.3332 8.04467 22.2885 7 20.9998 7C19.7112 7 18.6665 8.04467 18.6665 9.33333C18.6665 10.622 19.7112 11.6667 20.9998 11.6667Z"
                  stroke="#03838C"
                  strokeWidth="2.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M23.3333 20.9997C24.622 20.9997 25.6667 19.955 25.6667 18.6663C25.6667 17.3777 24.622 16.333 23.3333 16.333C22.0447 16.333 21 17.3777 21 18.6663C21 19.955 22.0447 20.9997 23.3333 20.9997Z"
                  stroke="#03838C"
                  strokeWidth="2.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.4999 11.667C11.2659 11.667 12.0245 11.8179 12.7322 12.111C13.4399 12.4042 14.083 12.8339 14.6247 13.3755C15.1663 13.9172 15.596 14.5603 15.8892 15.268C16.1823 15.9757 16.3332 16.7343 16.3332 17.5003V21.5837C16.3329 22.5595 15.9831 23.503 15.3472 24.2432C14.7112 24.9835 13.8312 25.4714 12.8666 25.6188C11.9019 25.7662 10.9163 25.5632 10.0884 25.0467C9.26044 24.5301 8.64489 23.7341 8.3532 22.8028C7.85542 21.1967 6.80543 20.1448 5.2032 19.647C4.27242 19.3555 3.47673 18.7404 2.96012 17.9131C2.44352 17.0857 2.24012 16.1008 2.38674 15.1365C2.53336 14.1722 3.0203 13.2923 3.75946 12.6559C4.49862 12.0195 5.44116 11.6687 6.41654 11.667H10.4999Z"
                  stroke="#03838C"
                  strokeWidth="2.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="mt-[20px] text-[20px] font-[700] text-[#222]">
              Faster Reunions
            </h3>
            <p className="mt-[10px] text-[16px] text-[#6A7181] leading-relaxed">
              License tags provide immediate ID so shelters can contact you
              without impounding your pet.
            </p>
          </article>
          {/* Public Health */}
          <article className="bg-white rounded-[28px] sm:p-[32px] p-[20px] ">
            <div
              className="w-[56px] h-[56px] rounded-[12px] bg-[#DBEDEE] flex items-center justify-center "
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
              >
                <path
                  d="M23.3332 15.1669C23.3332 21.0002 19.2498 23.9169 14.3965 25.6085C14.1424 25.6947 13.8663 25.6905 13.6148 25.5969C8.74984 23.9169 4.6665 21.0002 4.6665 15.1669V7.0002C4.6665 6.69078 4.78942 6.39403 5.00821 6.17524C5.22701 5.95645 5.52375 5.83353 5.83317 5.83353C8.1665 5.83353 11.0832 4.43353 13.1132 2.6602C13.3603 2.44903 13.6747 2.33301 13.9998 2.33301C14.3249 2.33301 14.6393 2.44903 14.8865 2.6602C16.9282 4.4452 19.8332 5.83353 22.1665 5.83353C22.4759 5.83353 22.7727 5.95645 22.9915 6.17524C23.2103 6.39403 23.3332 6.69078 23.3332 7.0002V15.1669Z"
                  stroke="#03838C"
                  strokeWidth="2.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.5 14.0003L12.8333 16.3337L17.5 11.667"
                  stroke="#03838C"
                  strokeWidth="2.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="mt-[20px] text-[20px] font-[700] text-[#222]">
              Public Health
            </h3>
            <p className="mt-[10px] text-[16px] text-[#6A7181] leading-relaxed">
              Ensures rabies vaccination compliance to keep our community safe.
            </p>
          </article>
          {/* Community Support */}
          <article className="bg-white rounded-[28px] sm:p-[32px] p-[20px] ">
            <div
              className="w-[56px] h-[56px] rounded-[12px] bg-[#DBEDEE] flex items-center justify-center "
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
              >
                <path
                  d="M22.1668 16.3333C23.9052 14.63 25.6668 12.5883 25.6668 9.91667C25.6668 8.21486 24.9908 6.58276 23.7874 5.3794C22.5841 4.17604 20.952 3.5 19.2502 3.5C17.1968 3.5 15.7502 4.08333 14.0002 5.83333C12.2502 4.08333 10.8035 3.5 8.75016 3.5C7.04836 3.5 5.41625 4.17604 4.21289 5.3794C3.00954 6.58276 2.3335 8.21486 2.3335 9.91667C2.3335 12.6 4.0835 14.6417 5.8335 16.3333L14.0002 24.5L22.1668 16.3333Z"
                  stroke="#03838C"
                  strokeWidth="2.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="mt-[20px] text-[20px] font-[700] text-[#222]">
              Support for Animal Shelters
            </h3>
            <p className="mt-[10px] text-[16px] text-[#6A7181] leading-relaxed">
              Fees fund local animal control and shelters without raising taxes.
            </p>
          </article>
        </div>
      </section>
      <div>
        <Image
          src="/images/shape2.svg"
          alt="Pet Registration"
          width={100}
          height={100}
          className="w-full"
        />
      </div>
    </>
  );
}
