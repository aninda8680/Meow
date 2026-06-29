import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vastShadow = localFont({
  src: "../public/Fonts/VastShadow-Regular.ttf",
  variable: "--font-vast-shadow",
});

const sourceCodePro = localFont({
  src: "../public/Fonts/SourceCodePro-VariableFont_wght.ttf",
  variable: "--font-source-code",
});

export const metadata: Metadata = {
  title: "Meow - Let's Focus!",
  description: "Let's focus on our goals!",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vastShadow.variable} ${sourceCodePro.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
