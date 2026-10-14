import type { Metadata } from "next";
import "./globals.css";
import { RootProviders } from "@/components/providers/root-providers";

export const metadata: Metadata = {
  title: "Skill_pulse ai — AI Career & Skill Navigator",
  description:
    "Modular career development platform and skill navigator with demo workspace, local persistence, profile builder, and career roadmap guidance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 font-sans">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}

