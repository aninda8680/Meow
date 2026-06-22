"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard, ShieldAlert, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function PortalPage() {
  const { data: session } = useSession();
  
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden">
      
      {/* HUD Elements */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-1 opacity-30">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em]" style={{ fontFamily: 'var(--font-malinton)' }}>
          MEOW // SYSTEM PORTAL
        </span>
      </div>

      <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-1 opacity-30">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em]" style={{ fontFamily: 'var(--font-malinton)' }}>
          SYS.ONLINE
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-mono opacity-60">SECURE</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl mx-4 flex flex-col items-center"
      >
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-4"
            style={{ fontFamily: 'var(--font-malinton)' }}
          >
            WELCOME, {session?.user?.name ? session.user.name.toUpperCase() : 'PILOT'}
          </motion.h1>
          <p className="text-foreground/50 text-sm tracking-widest uppercase">
            Select system module to initialize
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Dashboard Option */}
          <Link href="/dashboard" className="block w-full">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group border border-foreground/[0.08] bg-background/40 backdrop-blur-md p-8 h-64 flex flex-col items-center justify-center gap-6 overflow-hidden transition-all hover:border-foreground/30 hover:bg-foreground/[0.02]"
            >
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-foreground/20 group-hover:border-foreground/50 transition-colors" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-foreground/20 group-hover:border-foreground/50 transition-colors" />

              <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                <LayoutDashboard className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-bold tracking-wider mb-2" style={{ fontFamily: 'var(--font-malinton)' }}>
                  DASHBOARD
                </h2>
                <p className="text-xs text-foreground/50 uppercase tracking-widest">
                  Live fetching & Production report
                </p>
              </div>
            </motion.div>
          </Link>

          {/* Disturbance Tool Option */}
          <Link href="/disturbance" className="block w-full">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group border border-foreground/[0.08] bg-background/40 backdrop-blur-md p-8 h-64 flex flex-col items-center justify-center gap-6 overflow-hidden transition-all hover:border-foreground/30 hover:bg-foreground/[0.02]"
            >
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-foreground/20 group-hover:border-foreground/50 transition-colors" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-foreground/20 group-hover:border-foreground/50 transition-colors" />

              <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                <ShieldAlert className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity text-amber-500/70 group-hover:text-amber-500" />
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-bold tracking-wider mb-2" style={{ fontFamily: 'var(--font-malinton)' }}>
                  FOCUSSYNC
                </h2>
                <p className="text-xs text-foreground/50 uppercase tracking-widest">
                  Deep work &amp; smart call management
                </p>
              </div>
            </motion.div>
          </Link>
        </div>

        <button 
          onClick={handleLogout}
          className="mt-12 flex items-center gap-2 text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity hover:text-red-500"
        >
          <LogOut size={14} />
          Abort Session
        </button>
      </motion.div>

    </div>
  );
}
