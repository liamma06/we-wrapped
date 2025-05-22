"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string; // Keep this in the type but don't use it
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "#262626", // neutral-800 (matches dashboard cards)
    "#171717", // neutral-900 (matches dashboard background)
    "#1f1f1f", // in between neutral-800 and neutral-900
  ];
  const linearGradients = [
    "linear-gradient(to bottom right, #9333ea, #6366f1)", // purple-600 to indigo-500
    "linear-gradient(to bottom right, #8b5cf6, #4f46e5)", // violet-500 to indigo-600
    "linear-gradient(to bottom right, #a855f7, #6d28d9)", // purple-500 to violet-700
  ];

  const [backgroundGradient, setBackgroundGradient] = useState(
    linearGradients[0],
  );

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="relative flex flex-col md:flex-row h-[22rem] sm:h-[26rem] overflow-y-auto rounded-md p-0 mx-auto w-full max-w-5xl no-scrollbar"
      ref={ref}
    >
      {/* Left side - Scrollable title content */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-start">
        {content.map((item, index) => (
          <div
            key={item.title + index}
            className="w-full min-h-[22rem] sm:min-h-[26rem] flex items-center justify-center px-4 sm:px-8"
          >
            <motion.h2
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: activeCard === index ? 1 : 0.3,
                scale: activeCard === index ? 1.05 : 0.95,
              }}
              transition={{
                duration: 0.4,
                ease: "easeInOut",
              }}
              className="text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight text-center max-w-md"
            >
              {item.title}
            </motion.h2>
          </div>
        ))}
      </div>

      {/* Right side - Visual content */}
      <div className="sticky top-0 h-auto md:h-full w-full md:w-1/2 hidden md:block">
        <div
          style={{ background: backgroundGradient }}
          className={cn(
            "h-64 md:h-full w-full overflow-hidden rounded-b-md md:rounded-md transition-all duration-500",
            contentClassName,
          )}
        >
          {content[activeCard]?.content}
        </div>
      </div>

      {/* Small visual indicator for mobile */}
      <div
        style={{ background: backgroundGradient }}
        className="fixed bottom-4 right-4 h-10 w-10 rounded-full shadow-lg md:hidden"
      ></div>
    </motion.div>
  );
};
