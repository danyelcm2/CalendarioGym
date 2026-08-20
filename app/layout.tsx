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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
