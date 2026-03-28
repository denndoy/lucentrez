import { Metadata } from "next";
import { cookies } from "next/headers";
import { ContactForm } from "@/components/ContactForm";
import { LANG_COOKIE, normalizeLang } from "@/lib/lang";

export const metadata: Metadata = {
  title: "Contact | Lucentrez",
  description: "Contact Lucentrez for sizing, collabs, and product inquiries.",
};

export default async function ContactPage() {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value);

  return (
    <main className="w-full px-4 py-10 md:px-6 lg:px-10">
      <h1 className="font-display text-5xl uppercase leading-none text-foreground md:text-7xl">
        {lang === "id" ? "Kontak" : "Contact"}
      </h1>

      <ContactForm />
    </main>
  );
}
