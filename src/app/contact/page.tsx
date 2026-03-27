import { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Lucentrezn",
  description: "Contact Lucentrezn for sizing, collabs, and product inquiries.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Contact</p>
      <h1 className="mt-3 font-display text-5xl uppercase leading-none text-foreground md:text-7xl">
        Let&apos;s Talk About Your Next Fit
      </h1>
      <p className="mt-4 max-w-3xl text-muted">
        Reach our team instantly through marketplace channels and get support for sizing, stock, and orders.
      </p>

      <ContactForm />
    </main>
  );
}
