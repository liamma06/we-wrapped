"use client";
import React from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";

import Link from 'next/link'

const content = [
  {
    title: "Save & Edit Marks",
    description:
      "Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">
        <img
          src="/linear.webp"
          width={300}
          height={300}
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
  {
    title: "Gain Insights on Course Averages",
    description:
      "See changes as they happen. With our platform, you can track every modification in real time. No more confusion about the latest version of your project. Say goodbye to the chaos of version control and embrace the simplicity of real-time updates.",
    content: (
      <div className="flex h-full w-full items-center justify-center text-white">
        <img
          src="/linear.webp"
          width={300}
          height={300}
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
  {
    title: "Better Clarity on Program Progress",
    description:
      "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] text-white">
        <img
          src="/linear.webp"
          width={300}
          height={300}
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
];

 
export default function SpotlightNewDemo() {
  return (
    <div className=" w-full rounded-md flex flex-col md:items-center md:justify-center content-center bg-black/[0.1] antialiased relative overflow-hidden">
      <Spotlight />


      <div className="h-screen flex flex-col items-center justify-center ">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm">
            WE Wrapped
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300">
            A <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-900 via-purple-500 to-white"> smarter</span> look at your school year.
          </p>
        </div>
        
        {/* button container */}
        <div className="flex items-center justify-center mt-2 gap-8">

          {/* Scroll button */}
          <button
          onClick={() => {
            const el = document.getElementById("about-section");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className=" bottom-5 left-1/2 z-50 -translate-x-1/2 transform rounded-full p-3 backdrop-blur hover:bg-white/20"
          >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <button className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition duration-300"><Link href={'/signup'}>Get Started</Link></button>
        </div>

      </div>

      
      
       <div id= "about-section" className="flex items-center justify-center w-screen h-screen">
        <StickyScroll content={content} />
      </div>

    </div>
  );
}