"use client";

import { useEffect, useState, useRef } from "react";
import { MotionValue, useMotionValueEvent, useMotionValue } from "framer-motion";

type Mood = "neutral" | "happy" | "very-happy" | "angry" | "serious" | "curious" | "sleeping" | "sad" | "blink";

interface CatEyesProps {
  baseMood?: Mood;
  /** 0 = far left edge, 1 = far right edge of viewport. Can be number or MotionValue. */
  catXFraction?: number | MotionValue<number> | null;
  /** 0 = far top edge, 1 = far bottom edge of viewport. Can be number or MotionValue. */
  catYFraction?: number | MotionValue<number> | null;
}

export default function CatEyes({ baseMood = "neutral", catXFraction = null, catYFraction = null }: CatEyesProps) {
  const [currentMood, setCurrentMood] = useState<Mood>(baseMood);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [trackingOffset, setTrackingOffset] = useState({ x: 0, y: 0 });
  const trackingRef = useRef<NodeJS.Timeout | null>(null);

  // Latest numeric values for easing
  const xRef = useRef<number | null>(null);
  const yRef = useRef<number | null>(null);

  const isMounted = useRef(false);
  const isCatTracking = catXFraction !== null;

  // Use dummy motion values to avoid passing null to useMotionValueEvent
  const dummyX = useMotionValue(0.5);
  const dummyY = useMotionValue(0.5);

  const xMotionValue = (typeof catXFraction === "object" && catXFraction !== null) ? (catXFraction as MotionValue<number>) : dummyX;
  const yMotionValue = (typeof catYFraction === "object" && catYFraction !== null) ? (catYFraction as MotionValue<number>) : dummyY;

  // Handle MotionValue vs Number for catXFraction
  useMotionValueEvent(xMotionValue, "change", (latest: number) => {
    xRef.current = latest;
  });

  // Handle MotionValue vs Number for catYFraction
  useMotionValueEvent(yMotionValue, "change", (latest: number) => {
    yRef.current = latest;
  });

  // Initial and Number-based sync
  useEffect(() => {
    if (typeof catXFraction === "number") xRef.current = catXFraction;
    if (typeof catYFraction === "number") yRef.current = catYFraction;
  }, [catXFraction, catYFraction]);

  // Sync prop changes to state
  useEffect(() => {
    isMounted.current = true;
    setCurrentMood((prev) => (prev === "blink" ? prev : baseMood));
    return () => { isMounted.current = false; };
  }, [baseMood]);

  // Refs for Managing timeouts
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moodTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Blinking Loop - Stable
  useEffect(() => {
    const blinkLoop = () => {
      const nextBlink = Math.random() * 4000 + 2000;

      blinkTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) setCurrentMood("blink");

        setTimeout(() => {
          if (isMounted.current) setCurrentMood((prev) => (prev === "blink" ? baseMood : prev));

          if (Math.random() < 0.1) {
            setTimeout(() => {
              if (isMounted.current) setCurrentMood("blink");
              setTimeout(() => setCurrentMood((prev) => (prev === "blink" ? baseMood : prev)), 150);
            }, 100);
          }

          blinkLoop();
        }, 150);
      }, nextBlink);
    };

    blinkLoop();

    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, [baseMood]);

  // Cat-Tracking Effect — smoothly follow the cat's position from refs
  useEffect(() => {
    if (catXFraction === null) {
      setTrackingOffset({ x: 0, y: 0 });
      return;
    }

    if (trackingRef.current) clearTimeout(trackingRef.current);

    const ease = () => {
      const currentX = xRef.current ?? 0.5;
      const currentY = yRef.current ?? 0.5;

      const targetX = (currentX - 0.5) * 76;
      const targetY = (currentY - 0.5) * 40;

      if (isMounted.current) {
        setTrackingOffset((prev) => ({
          x: prev.x + (targetX - prev.x) * 0.18,
          y: prev.y + (targetY - prev.y) * 0.18,
        }));
      }
      trackingRef.current = setTimeout(ease, 40);
    };
    ease();

    return () => {
      if (trackingRef.current) clearTimeout(trackingRef.current);
    };
  }, [isCatTracking]);

  // Eye Movement Loop (idle)
  useEffect(() => {
    if (currentMood === "sleeping" || currentMood === "blink") return;
    if (isCatTracking) return;

    const moveLoop = () => {
      const delay = Math.random() * 2000 + 1000;

      moveTimeoutRef.current = setTimeout(() => {
        const action = Math.random();

        if (action < 0.3) {
          const direction = Math.random() > 0.5 ? 30 : -30;
          if (isMounted.current) setPupilOffset({ x: direction, y: 0 });
          setTimeout(() => {
            if (isMounted.current) setPupilOffset({ x: 0, y: 0 });
          }, 800);
        }
        else if (action < 0.6) {
          const firstDir = Math.random() > 0.5 ? 30 : -30;
          if (isMounted.current) setPupilOffset({ x: firstDir, y: 0 });
          setTimeout(() => {
            if (isMounted.current) setPupilOffset({ x: -firstDir, y: 0 });
            setTimeout(() => {
              if (isMounted.current) setPupilOffset({ x: 0, y: 0 });
            }, 500);
          }, 700);
        }
        else if (action < 0.8) {
          const verticalDir = Math.random() > 0.5 ? 20 : -20;
          if (isMounted.current) setPupilOffset({ x: 0, y: verticalDir });
          setTimeout(() => {
            if (isMounted.current) setPupilOffset({ x: 0, y: 0 });
          }, 800);
        }

        moveLoop();
      }, delay);
    };

    moveLoop();

    return () => {
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    };
  }, [currentMood, isCatTracking]);

  // Mood Change Loop
  useEffect(() => {
    const moodLoop = () => {
      const delay = Math.random() * 5000 + 3000;

      moodTimeoutRef.current = setTimeout(() => {
        const moods: Mood[] = ["neutral", "happy", "very-happy", "angry", "serious", "curious", "sleeping", "sad"];
        const newMood = moods[Math.floor(Math.random() * moods.length)];
        if (isMounted.current) setCurrentMood(newMood);

        if (newMood === "sleeping") {
          setTimeout(() => {
            if (isMounted.current) setCurrentMood("neutral");
          }, 3000);
        }

        moodLoop();
      }, delay);
    };

    moodLoop();

    return () => {
      if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current);
    };
  }, []);

  const effectiveOffset = isCatTracking ? trackingOffset : pupilOffset;

  return (
    <div className="wrapper">
      <div className="eyes-container">
        <div className={`eye left ${currentMood}`}></div>
        <div className={`eye right ${currentMood}`}></div>
      </div>
      <style jsx>{`
        .wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .eyes-container {
          display: flex;
          gap: 30px;
          justify-content: center;
          align-items: center;
          height: 100px;
        }
        .eye {
          width: 90px;
          height: 90px;
          background: var(--eye-color);
          border: 1px solid var(--eye-border);
          border-radius: 20px;
          flex-shrink: 0;
          transition:
            transform 0.12s cubic-bezier(0.22, 1, 0.36, 1),
            height 0.4s cubic-bezier(0.22, 1, 0.36, 1),
            margin-top 0.4s cubic-bezier(0.22, 1, 0.36, 1),
            border-radius 0.4s cubic-bezier(0.22, 1, 0.36, 1),
            width 0.4s cubic-bezier(0.22, 1, 0.36, 1),
            clip-path 0.4s cubic-bezier(0.22, 1, 0.36, 1),
            background-color 0.3s ease,
            border-color 0.3s ease;
          position: relative;
          overflow: hidden;
          transform: translate(${effectiveOffset.x}px, ${effectiveOffset.y}px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .eye.neutral { border-radius: 20px; height: 90px; }
        .eye.happy { height: 60px; margin-top: 15px; border-radius: 50% 50% 20px 20px; }
        .eye.happy::after { content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 50%; background: var(--background); border-radius: 50% 50% 0 0; }
        .eye.very-happy { height: 40px; margin-top: 25px; border-radius: 50% 50% 18px 18px; transform: scaleX(1.1) translate(${effectiveOffset.x}px, ${effectiveOffset.y}px); }
        .eye.very-happy::after { content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 60%; background: var(--background); border-radius: 50% 50% 0 0; }
        .eye.angry { height: 80px; border-radius: 8px; }
        .eye.angry.left { clip-path: polygon(0% 0%, 100% 40%, 100% 100%, 0% 100%); }
        .eye.angry.right { clip-path: polygon(0% 40%, 100% 0%, 100% 100%, 0% 100%); }
        .eye.serious { height: 45px; border-radius: 6px; margin-top: 15px; }
        .eye.serious.left { clip-path: polygon(0% 10%, 100% 60%, 100% 100%, 0% 100%); }
        .eye.serious.right { clip-path: polygon(0% 60%, 100% 10%, 100% 100%, 0% 100%); }
        .eye.curious { height: 70px; border-radius: 12px; }
        .eye.curious.left { height: 60px; margin-top: 10px; }
        .eye.curious.right { clip-path: polygon(0% 10%, 100% 45%, 100% 100%, 0% 100%); }
        .eye.sleeping { height: 6px; margin-top: 43px; border-radius: 3px; width: 80px; transform: translate(0, 0); opacity: 0.7; }
        .eye.sad { height: 75px; border-radius: 15px; margin-top: 10px; }
        .eye.sad.left { clip-path: polygon(0% 40%, 100% 10%, 100% 100%, 0% 100%); }
        .eye.sad.right { clip-path: polygon(0% 10%, 100% 40%, 100% 100%, 0% 100%); }
        .eye.blink { height: 4px; margin-top: 43px; border-radius: 2px; transform: translate(0, 0); }
      `}</style>
    </div>
  );
}
