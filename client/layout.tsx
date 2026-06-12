import type { Metadata } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leak Scanner",
  description: "OSINT Breach Checker Tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
        >
          <header className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 backdrop-blur-md bg-black/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />
              <h1 className="text-lg font-bold text-purple-400">
                Leak Scanner
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Show when="signed-out">
                <SignInButton>
                  <button className="px-4 py-2 text-sm rounded-lg border border-zinc-700 hover:border-purple-500 transition">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton>
                  <button className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-500 transition font-semibold">
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>

              <Show when="signed-in">
                <UserButton afterSignOutUrl="/" />
              </Show>
            </div>
          </header>

          <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}