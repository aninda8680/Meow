"use client";

import { signup } from './actions'
import { IconBrandGoogle } from '@tabler/icons-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { signIn } from 'next-auth/react'

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const message = searchParams.get('message')
  const [isSignUp, setIsSignUp] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [time, setTime] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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

  const handleCredentialsLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Invalid credentials')
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-background text-foreground overflow-hidden flex items-center justify-center"
    >
      {/* ... (rest of the background code remains the same) ... */}
      
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
                </div>
              </div>
            </div>

            {/* Auth Form */}
            <form 
              onSubmit={isSignUp ? undefined : handleCredentialsLogin}
              action={isSignUp ? signup : undefined}
              className="flex flex-col gap-5 relative"
            >
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-50" style={{ fontFamily: 'var(--font-malinton)' }}>
                    Pilot Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Maverick"
                    required={isSignUp}
                    className="w-full h-11 bg-foreground/[0.03] border border-foreground/[0.08] px-4 text-sm font-medium tracking-wide placeholder:text-foreground/20 focus:outline-none focus:border-foreground/30 focus:bg-foreground/[0.05] transition-all"
                  />
                </div>
              )}

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

              {(message || error) && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 border border-red-500/20 bg-red-500/5 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <span className="text-[11px] font-medium opacity-80">{error || message}</span>
                </motion.div>
              )}

              <div className="flex flex-col gap-2.5 mt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-[0.3em] transition-all shadow-[3px_3px_0px_rgba(0,0,0,0.4)] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.15)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:scale-[0.98] disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-malinton)' }}
                >
                  {isLoading ? 'Processing...' : (isSignUp ? 'Initialize' : 'Authenticate')}
                  {!isLoading && <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 animate-pulse" />}
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[1px] bg-foreground/[0.06]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-[8px] font-bold uppercase tracking-[0.5em] opacity-25" style={{ fontFamily: 'var(--font-malinton)' }}>OR</span>
              </div>
            </div>

            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="group w-full h-12 border border-foreground/[0.08] bg-foreground/[0.02] hover:bg-foreground/[0.06] flex items-center justify-center gap-3 transition-all hover:border-foreground/20"
            >
              <IconBrandGoogle className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 group-hover:opacity-100 transition-opacity" style={{ fontFamily: 'var(--font-malinton)' }}>Google</span>
            </button>

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
