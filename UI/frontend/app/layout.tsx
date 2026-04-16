import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WellSense AI — Production Dashboard",
  description: "Multi-output oil well production prediction using Random Forest and LSTM deep learning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
