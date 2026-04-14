import Image from "next/image";
import type { AppLang } from "@/lib/lang";

type FooterProps = {
  lang: AppLang;
};

const paymentLogos = [
  { src: "/images/payment/qris-logo.png", alt: "QRIS", width: 72, height: 28 },
  { src: "/images/payment/mandiri-logo.png", alt: "Mandiri", width: 88, height: 20 },
  { src: "/images/payment/seabank-logo.png", alt: "SeaBank", width: 86, height: 28 },
] as const;

const shipmentLogos = [
  { src: "/images/shipment/jne-logo.png", alt: "JNE", width: 92, height: 32 },
] as const;

export function Footer({ lang }: FooterProps) {
  const labels =
    lang === "id"
      ? {
          paymentMethod: "Metode Pembayaran",
          shipmentMethod: "Metode Pengiriman",
          rights: "Seluruh hak cipta dilindungi.",
        }
      : {
          paymentMethod: "Payment Method",
          shipmentMethod: "Shipment Method",
          rights: "All rights reserved.",
        };

  return (
    <footer className="border-t border-white/10 bg-[#111111] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-10">
        <div className="flex flex-col items-center gap-8 py-8 text-center">
          <div className="w-full max-w-5xl">
            <p className="text-base font-semibold text-white">{labels.paymentMethod}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 md:gap-x-8">
              {paymentLogos.map((logo) => (
                <Image
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className="object-contain opacity-90"
                />
              ))}
            </div>
          </div>

          <div className="w-full max-w-md">
            <p className="text-base font-semibold text-white">{labels.shipmentMethod}</p>
            <div className="mt-4 flex items-center justify-center">
              {shipmentLogos.map((logo) => (
                <Image
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className="object-contain opacity-90"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 pt-4 text-[11px] uppercase tracking-[0.14em] text-white/42 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Lucentrez</p>
          <p>{labels.rights}</p>
        </div>
      </div>
    </footer>
  );
}

