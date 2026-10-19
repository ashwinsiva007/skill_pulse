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
    <html lang="en" suppressHydrationWarning className="dark h-full antialiased" data-theme="dark" data-mode="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var saved = localStorage.getItem('skillpulse_active_theme');
                var theme = 'dark';
                if (saved === 'light' || (saved && saved.indexOf('light') !== -1)) {
                  theme = 'light';
                } else {
                  theme = 'dark';
                }
                
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.setAttribute('data-mode', theme);
                document.documentElement.style.setProperty('--theme-font', "'Inter', -apple-system, BlinkMacSystemFont, sans-serif");

                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch(e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}

