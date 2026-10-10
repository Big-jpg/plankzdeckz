"use client";

// Adapted from React Bits FadeContent by David Haz.
// Pinned upstream source and licence: THIRD_PARTY_NOTICES.md.
import { useEffect, useRef, type HTMLAttributes } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface FadeContentProps extends HTMLAttributes<HTMLDivElement> {
  duration?: number;
  delay?: number;
  threshold?: number;
}

export default function FadeContent({
  children,
  className,
  duration = 0.55,
  delay = 0,
  threshold = 0.12,
  ...props
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      // Keep server-rendered content visible and usable without JavaScript.
      // The restrained initial opacity also leaves unrevealed content readable.
      const timeline = gsap.timeline({ paused: true, delay });
      timeline.fromTo(
        element,
        { opacity: 0.65 },
        { opacity: 1, duration, ease: "power2.out", clearProps: "opacity" },
      );
      const trigger = ScrollTrigger.create({
        trigger: element,
        start: "top " + (1 - threshold) * 100 + "%",
        once: true,
        onEnter: () => timeline.play(),
      });
      const revealOnFocus = () => timeline.progress(1);
      element.addEventListener("focusin", revealOnFocus);
      return () => {
        element.removeEventListener("focusin", revealOnFocus);
        trigger.kill();
        timeline.kill();
      };
    });

    return () => media.revert();
  }, [duration, delay, threshold]);

  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
}
