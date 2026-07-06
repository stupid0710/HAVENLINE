import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HavenlineProvider } from "../context/HavenlineContext";
import HealthAssistant from "../components/health-assistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Havenline | AI Healthcare Appointment & Urgency Manager",
  description: "Helping patients find the right care, at the right hospital, at the right time. Live queue tracking and AI symptom triage.",
  keywords: "healthcare, emergency triage, hospital queue, appointment booking, delhi hospitals, AI healthcare",
  authors: [{ name: "Havenline team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F5F5F7] text-slate-800 selection:bg-[#00C853] selection:text-white relative overflow-x-hidden">
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00C853]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00B8D4]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <HavenlineProvider>
          <div className="relative z-10 min-h-screen flex flex-col">
            {children}
          </div>
          <HealthAssistant />
        </HavenlineProvider>
      </body>
    </html>
  );
}


