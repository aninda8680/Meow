'use server'

import { redirect } from 'next/navigation'
import dbConnect from '../../lib/mongodb'
import User from '../../models/User'
import bcrypt from 'bcryptjs'

export async function login(formData: FormData) {
  // This will be handled by the client-side signIn call from next-auth/react
  // But we can keep it here if we use a custom server-side sign-in flow
  // For now, we'll let the client handle it via signIn('credentials', ...)
}

export async function signup(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?message=Email and password are required')
  }

  await dbConnect()

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    redirect('/login?message=User already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  
  await User.create({
    name,
    email,
    password: hashedPassword,
  })

  redirect('/login?message=Signup successful! You can now login.')
}

export async function signInWithGoogle() {
  // This is usually handled by signIn('google') on the client side
}
