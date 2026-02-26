import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ResearchProvider } from "@/context/ResearchContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevLens — Next.js Learning OS",
  description: "Intelligent, self-updating learning platform for Next.js and React",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen`}>
        <ResearchProvider>
          <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <a href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  <span className="font-semibold text-zinc-100">DevLens</span>
                </a>
                
                <div className="flex items-center gap-6">
                  <a href="/topics" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                    Topics
                  </a>
                  <a href="/flashcards" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                    Flashcards
                  </a>
                </div>
              </div>
            </div>
          </nav>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </ResearchProvider>
      </body>
    </html>
  );
}
