"use client";
import React from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
 
export default function SpotlightNewDemo() {
  return (
    <div className="h-[40rem] w-full rounded-md flex md:items-center md:justify-center bg-black/[0.70] antialiased relative overflow-hidden">
      <Spotlight />
      <h1>WE Wrapped: A smarter look at your school year.</h1>
    </div>
  );
}