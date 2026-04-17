"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import { SettingsModal } from "./pages/SettingsModal";

interface SettingsButtonProps {
    className?: string;
}

export function SettingsButton({ className }: SettingsButtonProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`p-3 rounded-full bg-foreground/5 dark:bg-foreground/5 backdrop-blur-md border border-foreground/10 shadow-lg hover:scale-110 active:scale-95 transition-all group ${className || ''}`}
                aria-label="Open settings"
            >
                <Settings className="w-5 h-5 text-foreground opacity-70 group-hover:opacity-100 transition-all group-hover:rotate-90 duration-500" />
            </button>


            <SettingsModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
