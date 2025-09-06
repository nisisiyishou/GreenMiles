"use client"

// app/page.tsx
import Image from "next/image";
import "./index.css";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

function IconFoot() {
  return (
    <svg fill="currentColor" className="h-7 w-7" viewBox="0 0 24 24">

      <g id="SVGRepo_bgCarrier" strokeWidth="0" />

      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />

      <g id="SVGRepo_iconCarrier">

        <path d="M10.035,18.069a7.981,7.981,0,0,0,3.938-1.035l3.332,3.332a2.164,2.164,0,0,0,3.061-3.061l-3.332-3.332A8.032,8.032,0,0,0,4.354,4.354a8.034,8.034,0,0,0,5.681,13.715ZM5.768,5.768A6.033,6.033,0,1,1,4,10.035,5.989,5.989,0,0,1,5.768,5.768Z" />

      </g>

    </svg>
  );
}
function IconFind() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">

      <g id="SVGRepo_bgCarrier" strokeWidth="0" />

      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />

      <g id="SVGRepo_iconCarrier"> <path d="M12 17H19L14.5 10.5H17.5L12 3L6.5 10.5H9.5L5 17H12ZM12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> </g>

    </svg>
  );
}
function IconTree() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="#82deaa" stroke="#82deaa">

      <g id="SVGRepo_bgCarrier" strokeWidth="0" />

      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />

      <g id="SVGRepo_iconCarrier"> <title>foot_line</title> <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g id="Map" transform="translate(-768.000000, 0.000000)" fillRule="nonzero"> <g id="foot_line" transform="translate(768.000000, 0.000000)"> <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fillRule="nonzero"> </path> <path d="M7.95965,7.25709 C9.35656,6.20969 11.3117,5.74588 13.2081,6.13844 C14.4517,6.39586 15.8986,6.93014 17.0454,8.12993 C18.2087,9.34687 18.9543,11.1336 18.9989,13.6782 C19.037,15.854 18.0076,18.1979 16.627,19.8103 C15.9309,20.6234 15.0935,21.3126 14.1763,21.6909 C13.2402,22.0771 12.1824,22.1486 11.1839,21.6318 C10.2914,21.1699 9.7029,20.5682 9.41342,19.8177 C9.1364,19.0995 9.191,18.3856 9.27943,17.8255 L9.31904889,17.5946037 L9.31904889,17.5946037 L9.43206,17.0248 C9.48232,16.7755 9.52095,16.5661 9.541,16.3732 C9.5808,15.9901 9.53343,15.7905 9.44088,15.6469 C9.21918125,15.302675 8.93744984,15.0967984 8.52145844,14.8268869 L7.97239,14.4721 L7.97239,14.4721 L7.7056577,14.2896426 C7.07520406,13.838725 6.4085,13.19665 6.13179,12.0511 C5.64736,10.0455 6.54109,8.32073 7.95965,7.25709 Z M12.8027,8.09692 C11.4583,7.81864 10.0896,8.1598 9.15944,8.85725 C8.25092,9.53846 7.81426,10.4984 8.07588,11.5815 C8.199855,12.09468 8.462745,12.379359 8.91477081,12.6951339 L9.1908675,12.87815 L9.1908675,12.87815 L9.6623352,13.1778128 C10.1440344,13.494968 10.71214,13.92708 11.1223,14.5638 C11.5666,15.2537 11.592,15.9863 11.5303,16.5799 C11.5098333,16.7769 11.4782556,16.9715 11.4442778,17.1547519 L11.2863519,17.9545222 C11.2750889,18.0159222 11.2646,18.0765667 11.255,18.1374 C11.1836,18.5891 11.1944,18.8774 11.2794,19.098 C11.352,19.2863 11.5316,19.5598 12.1031,19.8556 C12.4665,20.0436 12.8924,20.0571 13.4136,19.8421 C13.9537,19.6192 14.5473,19.1642 15.1078,18.5095 C16.2405,17.1867 17.0271,15.3018 16.9992,13.7132 C16.9615,11.5593 16.3452,10.2919 15.5997,9.5119 C14.8377,8.71479 13.829,8.30936 12.8027,8.09692 Z M5,3.5 C6.10457,3.5 7,4.39543 7,5.5 C7,6.60457 6.10457,7.5 5,7.5 C3.89543,7.5 3,6.60457 3,5.5 C3,4.39543 3.89543,3.5 5,3.5 Z M18.5,4.5 C19.0523,4.5 19.5,4.94772 19.5,5.5 C19.5,6.05228 19.0523,6.5 18.5,6.5 C17.9477,6.5 17.5,6.05228 17.5,5.5 C17.5,4.94772 17.9477,4.5 18.5,4.5 Z M9.5,2 C10.3284,2 11,2.67157 11,3.5 C11,4.32843 10.3284,5 9.5,5 C8.67157,5 8,4.32843 8,3.5 C8,2.67157 8.67157,2 9.5,2 Z M14.5,2 C15.3284,2 16,2.67157 16,3.5 C16,4.32843 15.3284,5 14.5,5 C13.6716,5 13,4.32843 13,3.5 C13,2.67157 13.6716,2 14.5,2 Z" id="形状" fill="currentColor"> </path> </g> </g> </g> </g>

    </svg>
  );
}
function IconMembers() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4M12 20a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [now, setNow] = useState(new Date());

  // ……组件里
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatted = now.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });


  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const buttons = [
    { icon: <IconFind />, to: "/phone/comming-soon1" },
    { icon: <IconFoot />, to: "/phone/infractructure-path" },
    { icon: <IconFind />, to: "/phone/green-trail" },
    { icon: <IconTree />, to: "/phone/storylines" },
    { icon: <IconFind />, to: "/phone/comming-soon2" },
  ];


  useEffect(() => {
    const i = buttons.findIndex(b => pathname.startsWith(b.to));
    setActiveIndex(i >= 0 ? i : null);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const buttonClick = (to: string, i: number) => {
    if (activeIndex === i) {
      setActiveIndex(null);
      router.push("/phone");
    } else {
      setActiveIndex(i);
      router.push(to);
    }
  };


  return (
    <div className="overflow-auto min-h-screen grid place-items-center bg-neutral-600 text-white">
      <div className="absolute w-full h-[100vh] top-0 left-0">
        <Image
          src="/background.jpg"
          alt="background"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-emerald-900/25" />

        {/* <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-900/70 via-transparent to-transparent" /> */}

      </div>




      {/* <div className="absolute inset-0 bg-emerald-900/40" /> */}

      <div className="z-10">
        {children}
      </div>





      <footer className="fixed inset-x-0 bottom-0 overflow-hidden z-20">
        <div className="absolute -inset-x-6 bottom-0 top-0 bg-gradient-to-t from-emerald-950/80 via-emerald-900/40 to-transparent" />

        <div className="reveal relative px-6 pb-3"
          style={{ ["--delay" as any]: "400ms" }}
        >
          <div className="mt-3 flex items-center justify-center gap-2">
            {buttons.map((btn, i) => {
              const baseZoom = 0.85;
              const zoom =
                activeIndex === null
                  ? baseZoom
                  : Math.max(0.7, 1 - Math.abs(i - activeIndex) * 0.15);

              return (
                <div
                  key={i}
                  onClick={() => buttonClick(btn.to, i)}
                  style={{ ["--zoom" as any]: zoom }}
                  className={`main-button ${i === activeIndex ? "active" : ""}`}
                >
                  {btn.icon}
                </div>
              );
            })}
          </div>


          <p className="mt-2 text-center text-xs text-gray-300">Hackathon - Comm Stem - USYD.</p>

          <p className="mt-5 text-center text-[10px] tracking-[0.35em] uppercase text-white/30">
            Explore the city
          </p>
        </div>
      </footer>
    </div>
  );
}