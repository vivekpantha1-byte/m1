import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "MIRA — Multimodal Interactive Rehearsal Assistant",
  description:
    "Rehearse a spoken conversation with a 3D virtual client and get an AI communication-coaching report.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col bg-paper text-navy">
        {children}
      </body>
    </html>
  );
}
