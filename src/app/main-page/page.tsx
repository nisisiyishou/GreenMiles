"use client"

// app/page.tsx
import Image from "next/image";
import "./index.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function IconMenu() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
function IconDining() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <path d="M7 3v10M11 3v10M7 13h4M17 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
function IconTee() {
    return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
            <path d="M12 3a4 4 0 0 1 4 4c0 2.761-4 6-4 6s-4-3.239-4-6a4 4 0 0 1 4-4z" fill="currentColor" />
            <path d="M12 13v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
function IconCalendar() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

export default function Home() {

    const [now, setNow] = useState(new Date(1757161244156));


    const router = useRouter()

    useEffect(() => {
        setNow(new Date());
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


    return (
        <>


            <section className="flex flex-col items-center absolute left-0 right-0 px-6" style={{ top: "5%" }}>
            </section>

            {/* 42 */}
            <section className="flex flex-col items-center absolute left-0 right-0 px-6" style={{ top: "35%" }}>


                <p className="reveal text-xs tracking-widest uppercase opacity-80"
                    style={{ ["--delay" as any]: "0ms" }}
                > {formatted}</p>

                <h1 className="reveal mt-3 text-4xl"
                    style={{ ["--delay" as any]: "100ms" }}
                >Green Miles</h1>


                <button
                    className="reveal display-button mt-6 inline-flex justify-center items-center gap-2 px-3 py-1 text-xs tracking-[0.25em] uppercase backdrop-blur-sm"
                    style={{ ["--delay" as any]: "200ms" }}
                >
                    Walk With Nature
                </button>

                <button
                    className="reveal display-button mt-6 inline-flex justify-center items-center gap-2 px-3 py-1 text-xs tracking-[0.25em] uppercase backdrop-blur-sm"
                    style={{ ["--delay" as any]: "300ms" }}
                >
                    Build For Tomorrow
                </button>


            </section >


        </>
    );
}