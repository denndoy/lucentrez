import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Oswald } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { LANG_COOKIE, normalizeLang } from "@/lib/lang";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-main",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Lucentrez",
    template: "%s | Lucentrez",
  },
  description:
    "Lucentrez is a bold streetwear catalog website. Discover drops, explore lookbooks, and buy directly via marketplace.",
  openGraph: {
    title: "Lucentrez",
    description:
      "Browse Lucentrez products and continue secure checkout on marketplace.",
    type: "website",
    images: [
      {
        url: "/gallery/look-01.svg",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value);

  return (
    <html lang={lang} className={`${oswald.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar initialLang={lang} />
        <div className="flex-1">{children}</div>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
