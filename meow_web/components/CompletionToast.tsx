"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, CheckCircle2 } from "lucide-react";

interface CompletionToastProps {
    show: boolean;
    onClose: () => void;
    message: string;
    subMessage: string;
}

export default function CompletionToast({ show, onClose, message, subMessage }: CompletionToastProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm"
                >
                    <div className="mx-4 bg-foreground/[0.08] backdrop-blur-2xl border border-foreground/[0.15] rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
                            <PartyPopper className="w-6 h-6 text-foreground/80" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em]">{message}</h3>
                            <p className="text-xs opacity-50 font-medium italic">{subMessage}</p>
                        </div>

                        <button
                            onClick={onClose}
                            className="bg-foreground text-background px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all mt-2"
                        >
                            Got it
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
