import type { Metadata } from "next";
import { Bebas_Neue, Sora } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const sora = Sora({
  variable: "--font-sans-main",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--font-display-main",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Lucentrezn | Premium Streetwear",
    template: "%s | Lucentrezn",
  },
  description:
    "Lucentrezn is a bold streetwear catalog website. Discover drops, explore lookbooks, and buy directly via marketplace.",
  openGraph: {
    title: "Lucentrezn | Premium Streetwear",
    description:
      "Browse Lucentrezn products and continue secure checkout on marketplace.",
    type: "website",
    images: [
      {
        url: "/gallery/look-01.svg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${bebas.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
