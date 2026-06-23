"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode } from "react";

interface SmoothScrollProps {
    children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
    return (
        <ReactLenis root options={{ lerp: 0.05, duration: 2.0, smoothWheel: true, wheelMultiplier: 0.8 }}>
            {children}
        </ReactLenis>
    );
}
