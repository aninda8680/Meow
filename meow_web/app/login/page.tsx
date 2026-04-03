"use client";

import { login, signup, signInWithGoogle } from './actions'
import { IconBrandGoogle } from '@tabler/icons-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [isSignUp, setIsSignUp] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [time, setTime] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-background text-foreground overflow-hidden flex items-center justify-center"
    >
      {/* Perspective Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ perspective: '1000px' }}>
        <motion.div
          animate={{
            rotateX: (mousePos.y - 0.5) * 8,
            rotateY: (mousePos.x - 0.5) * -8,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d', scale: 1.3 }}
        >
          <div
            className="w-[200%] h-[200%] opacity-[0.04] dark:opacity-[0.07]"
            style={{
              backgroundImage: 'linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
              maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 70%)',
            }}
          />
        </motion.div>

        {/* Data stream lines */}
        <div className="absolute inset-0 overflow-hidden opacity-15">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ top: '-20%', left: `${15 * i + 5}%` }}
              animate={{ top: '120%' }}
              transition={{
                duration: 6 + i * 1.5,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 1.2,
              }}
              className="absolute w-[1px] h-32 bg-gradient-to-b from-transparent via-foreground/30 to-transparent"
            />
          ))}
        </div>

        {/* Horizontal scanner line */}
        <motion.div
          animate={{ y: ['-100vh', '100vh'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent z-0"
        />
      </div>

      {/* HUD Corner Elements */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-1 opacity-30">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em]" style={{ fontFamily: 'var(--font-malinton)' }}>
          MEOW // AUTH TERMINAL
        </span>
        <span className="text-[9px] font-mono opacity-60">{time}</span>
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

      <div className="absolute bottom-6 left-6 z-20 opacity-20">
        <Link href="/" className="text-[9px] font-bold uppercase tracking-[0.4em] hover:opacity-100 transition-opacity" style={{ fontFamily: 'var(--font-malinton)' }}>
          ← ABORT // HOME
        </Link>
      </div>

      <div className="absolute bottom-6 right-6 z-20 opacity-20">
        <span className="text-[8px] font-mono">v0.1.0-alpha</span>
      </div>

      {/* Main Auth Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        {/* Outer frame with corner accents */}
        <div className="relative">
          {/* Corner brackets */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-foreground/20" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-foreground/20" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-foreground/20" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-foreground/20" />

          <div className="border border-foreground/[0.08] bg-background/80 backdrop-blur-xl p-8 md:p-10 relative overflow-hidden">
            {/* Scan line overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.02]"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, var(--foreground) 0px, var(--foreground) 1px, transparent 1px, transparent 3px)',
              }}
            />

            {/* Header */}
            <div className="relative mb-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-[1px] bg-gradient-to-r from-foreground/30 to-transparent mb-6"
              />

              <div className="flex items-end justify-between">
                <div>
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-4xl md:text-5xl font-black tracking-tighter leading-none"
                    style={{ fontFamily: 'var(--font-malinton)' }}
                  >
                    {isSignUp ? 'JOIN' : 'ENTER'}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 0.5 }}
                    className="text-[10px] font-bold uppercase tracking-[0.3em] mt-2"
                    style={{ fontFamily: 'var(--font-malinton)' }}
                  >
                    {isSignUp ? 'Initialize new pilot profile' : 'Authenticate to proceed'}
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  transition={{ delay: 0.6 }}
                  className="text-6xl font-black leading-none tracking-tighter select-none"
                  style={{ fontFamily: 'var(--font-malinton)' }}
                >
                  {isSignUp ? '02' : '01'}
                </motion.div>
              </div>
            </div>

            {/* Auth Form */}
            <form className="flex flex-col gap-5 relative">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-50" style={{ fontFamily: 'var(--font-malinton)' }}>
                  Identifier
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="pilot@meow.sys"
                  required
                  className="w-full h-11 bg-foreground/[0.03] border border-foreground/[0.08] px-4 text-sm font-medium tracking-wide placeholder:text-foreground/20 focus:outline-none focus:border-foreground/30 focus:bg-foreground/[0.05] transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-50" style={{ fontFamily: 'var(--font-malinton)' }}>
                  Passkey
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••••"
                  required
                  className="w-full h-11 bg-foreground/[0.03] border border-foreground/[0.08] px-4 text-sm font-medium tracking-[0.2em] placeholder:text-foreground/20 focus:outline-none focus:border-foreground/30 focus:bg-foreground/[0.05] transition-all"
                />
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 border border-red-500/20 bg-red-500/5 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <span className="text-[11px] font-medium opacity-80">{message}</span>
                </motion.div>
              )}

              <div className="flex flex-col gap-2.5 mt-2">
                <button
                  formAction={isSignUp ? signup : login}
                  className="group relative w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-[0.3em] transition-all shadow-[3px_3px_0px_rgba(0,0,0,0.4)] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.15)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:scale-[0.98]"
                  style={{ fontFamily: 'var(--font-malinton)' }}
                >
                  {isSignUp ? 'Initialize' : 'Authenticate'}
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 animate-pulse" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full h-10 border border-foreground/[0.08] bg-transparent text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 hover:opacity-100 hover:border-foreground/20 transition-all"
                  style={{ fontFamily: 'var(--font-malinton)' }}
                >
                  {isSignUp ? '← Back to Sign In' : 'New pilot? Create account'}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[1px] bg-foreground/[0.06]" />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="bg-background px-4 text-[8px] font-bold uppercase tracking-[0.5em] opacity-25"
                  style={{ fontFamily: 'var(--font-malinton)' }}
                >
                  OR
                </span>
              </div>
            </div>

            {/* Google OAuth */}
            <form>
              <button
                formAction={signInWithGoogle}
                className="group w-full h-12 border border-foreground/[0.08] bg-foreground/[0.02] hover:bg-foreground/[0.06] flex items-center justify-center gap-3 transition-all hover:border-foreground/20"
              >
                <IconBrandGoogle className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'var(--font-malinton)' }}
                >
                  Google
                </span>
              </button>
            </form>

            {/* Bottom bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent mt-8"
            />
          </div>
        </div>
      </motion.div>

      {/* Side decoration text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.02 }}
        transition={{ delay: 1 }}
        className="fixed left-8 top-1/2 -translate-y-1/2 -rotate-90 text-[12vw] font-black tracking-tighter whitespace-nowrap select-none pointer-events-none leading-none uppercase z-0"
        style={{ fontFamily: 'var(--font-malinton)' }}
      >
        MEOW
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
