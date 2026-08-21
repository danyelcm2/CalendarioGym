import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Calendario Gym",
  description: "Planificador semanal de entrenamientos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                  document.documentElement.style.colorScheme = theme;
                  var accents = {
                    blue: ['#2563eb', '#1d4ed8', '#eff6ff', '#dbeafe', '#1e3a5f', '#bfdbfe'],
                    cyan: ['#0891b2', '#0e7490', '#ecfeff', '#cffafe', '#164e63', '#a5f3fc'],
                    rose: ['#e11d48', '#be123c', '#fff1f2', '#ffe4e6', '#881337', '#fecdd3'],
                    amber: ['#d97706', '#b45309', '#fffbeb', '#fef3c7', '#78350f', '#fde68a'],
                    violet: ['#7c3aed', '#6d28d9', '#f5f3ff', '#ede9fe', '#4c1d95', '#ddd6fe']
                  };
                  var accent = accents[localStorage.getItem('calendario-gym-accent') || 'blue'] || accents.blue;
                  document.documentElement.style.setProperty('--accent', accent[0]);
                  document.documentElement.style.setProperty('--accent-hover', accent[1]);
                  document.documentElement.style.setProperty('--accent-soft', accent[2]);
                  document.documentElement.style.setProperty('--accent-soft-strong', accent[3]);
                  document.documentElement.style.setProperty('--accent-soft-dark', accent[4]);
                  document.documentElement.style.setProperty('--accent-dark-text', accent[5]);
                } catch (error) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
