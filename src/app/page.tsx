import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { LANG_COOKIE, normalizeLang } from "@/lib/lang";

export default async function Home() {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value);

  return (
    <section className="relative min-h-[calc(100vh-84px)] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2048&h=1365&q=80"
        alt="Lucentrez hero"
        className="left-0 top-0 h-full w-full object-cover absolute"
        fill
        priority
      />
      <div className="absolute inset-0 bg-black/28" />

      <div className="relative z-10 flex min-h-[calc(100vh-84px)] items-center justify-center px-6">
        <Link
          href="/catalog"
          className="relative inline-flex h-9 min-h-9 shrink-0 select-none items-center justify-center gap-2 rounded-full border border-white bg-transparent px-5 text-center text-xs font-semibold uppercase tracking-[0.18em] !text-white transition-[background-color,border-color,filter] duration-150 ease-in-out hover:border-white/90 hover:bg-white/18 hover:!text-white hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {lang === "id" ? "BELANJA" : "SHOP HERE"}
        </Link>
      </div>
    </section>
  );
}
