"use client";

import { IconBrandGoogle } from '@tabler/icons-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { signIn } from 'next-auth/react'

function LoginContent() {
  const searchParams = useSearchParams()
  const authError = searchParams.get('error')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen text-foreground overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #d4d4d0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.4,
        }}
      />

      {/* HUD: top-left */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-1" style={{ color: "rgba(23,23,23,0.3)" }}>
        <span className="text-[10px] font-medium uppercase tracking-[0.4em]" style={{ fontFamily: 'var(--font-pixel)' }}>
          MEOW // AUTH
        </span>
        <span className="text-[9px] font-mono opacity-60">{time}</span>
      </div>

      {/* HUD: top-right */}
      <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-1" style={{ color: "rgba(23,23,23,0.3)" }}>
        <span className="text-[10px] font-medium uppercase tracking-[0.4em]" style={{ fontFamily: 'var(--font-pixel)' }}>
          SYS.ONLINE
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-mono opacity-60">SECURE</span>
        </div>
      </div>

      {/* HUD: bottom-left */}
      <div className="absolute bottom-6 left-6 z-20" style={{ color: "rgba(23,23,23,0.25)" }}>
        <Link href="/" className="text-[10px] font-medium uppercase tracking-[0.4em] hover:opacity-100 transition-opacity" style={{ fontFamily: 'var(--font-pixel)' }}>
          ← Back to Home
        </Link>
      </div>

      {/* HUD: bottom-right */}
      <div className="absolute bottom-6 right-6 z-20" style={{ color: "rgba(23,23,23,0.2)" }}>
        <span className="text-[8px] font-mono">v0.1.0-alpha</span>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[400px] mx-4"
      >
        {/* Corner brackets */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: "rgba(23,23,23,0.15)" }} />
        <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: "rgba(23,23,23,0.15)" }} />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: "rgba(23,23,23,0.15)" }} />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: "rgba(23,23,23,0.15)" }} />

        <div
          className="p-8 md:p-10"
          style={{
            backgroundColor: "#fff",
            border: "1px solid rgba(23,23,23,0.08)",
            boxShadow: "0 4px 40px rgba(23,23,23,0.08)",
          }}
        >
          {/* Top rule */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-[1px] mb-8"
            style={{ background: "linear-gradient(to right, rgba(23,23,23,0.25), transparent)" }}
          />

          {/* Heading */}
          <div className="mb-8">
            <span
              className="text-[11px] font-medium uppercase tracking-[0.4em] block mb-3"
              style={{ color: "rgba(23,23,23,0.3)", fontFamily: 'var(--font-pixel)' }}
            >
              Authentication
            </span>
            <h1
              className="text-5xl font-black tracking-tighter leading-none"
              style={{ fontFamily: 'var(--font-malinton)', color: "#171717" }}
            >
              ENTER
            </h1>
            <p className="mt-3 text-sm" style={{ color: "rgba(23,23,23,0.45)" }}>
              Sign in to access your focus dashboard.
            </p>
          </div>

          {/* Error */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 mb-5 rounded-lg text-sm"
              style={{ border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.05)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-medium" style={{ color: "rgba(23,23,23,0.7)" }}>
                {authError === 'OAuthAccountNotLinked'
                  ? 'Account already exists with a different provider.'
                  : authError}
              </span>
            </motion.div>
          )}

          {/* Google button */}
          <button
            onClick={async () => {
              setIsGoogleLoading(true)
              await signIn('google', { callbackUrl: '/dashboard' })
            }}
            disabled={isGoogleLoading}
            className="group w-full h-14 flex items-center justify-center gap-3 rounded-xl font-bold text-sm transition-all duration-200"
            style={{
              backgroundColor: "#171717",
              color: "#FAFAF8",
              boxShadow: "4px 4px 0px rgba(23,23,23,0.2)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translate(2px,2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0px rgba(23,23,23,0.2)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translate(0,0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "4px 4px 0px rgba(23,23,23,0.2)";
            }}
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
            ) : (
              <IconBrandGoogle className="w-5 h-5 opacity-80" />
            )}
            <span
              className="text-[12px] font-medium uppercase tracking-[0.3em]"
              style={{ fontFamily: 'var(--font-pixel)' }}
            >
              {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
            </span>
          </button>

          <p
            className="mt-5 text-center text-[10px] leading-relaxed"
            style={{ color: "rgba(23,23,23,0.3)" }}
          >
            By continuing, you agree to our{' '}
            <a href="#" className="underline underline-offset-2 hover:opacity-70 transition-opacity">Terms</a>
            {' '}and{' '}
            <a href="#" className="underline underline-offset-2 hover:opacity-70 transition-opacity">Privacy Policy</a>.
          </p>

          {/* Bottom rule */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.4, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="h-[1px] mt-8"
            style={{ background: "linear-gradient(to right, transparent, rgba(23,23,23,0.1), transparent)" }}
          />
        </div>
      </motion.div>

      {/* Ghost MEOW text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.025 }}
        transition={{ delay: 0.8 }}
        className="fixed left-8 top-1/2 -translate-y-1/2 -rotate-90 text-[14vw] font-black tracking-tighter whitespace-nowrap select-none pointer-events-none leading-none uppercase z-0"
        style={{ fontFamily: 'var(--font-malinton)', color: "#171717" }}
      >
        MEOW
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAFAF8" }}>
        <div className="w-5 h-5 border-2 border-black/10 border-t-black/40 rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
