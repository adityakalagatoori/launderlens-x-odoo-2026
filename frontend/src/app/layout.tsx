import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  title: "Traveloop | Luxury Reimagined",
  description: "Cinematic, premium onboarding experience for modern travelers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-inter antialiased">
        {/* Ambient Animated Background Elements across the whole app */}
        <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#63D5DF]/30 blur-[120px] mix-blend-overlay animate-float" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#F3E2D2]/40 blur-[150px] mix-blend-overlay animate-float-delayed" />
          <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-[#AEE7EC]/20 blur-[100px] mix-blend-overlay animate-pulse-slow" />
        </div>
        
        <Navbar />
        <Sidebar />
        <main className="lg:pl-44 transition-all duration-500">
          {children}
        </main>
      </body>
    </html>
  );
}
