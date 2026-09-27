import type { Metadata } from "next";
import { Lora, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const serif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"]
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "PrivacyLens — Know what they know",
  description:
    "Enter any website's privacy policy and get a plain-language dossier: what data is collected, why, who receives it, how long it's kept, and what you can do about it."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
