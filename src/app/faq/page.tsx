import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Lucentrezn",
  description: "Frequently asked questions about shopping Lucentrezn via marketplace.",
};

const items = [
  {
    q: "How do I buy products?",
    a: "All purchases happen through our official marketplace store. Click Buy on marketplace from any product page to continue checkout.",
  },
  {
    q: "Where do you ship?",
    a: "We ship across Indonesia through marketplace-supported couriers. Delivery speed depends on your selected shipping option.",
  },
  {
    q: "How do I choose size?",
    a: "Each product page includes size notes. If you prefer an oversized look, go one size up. Contact us for exact measurements.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-14 md:px-8">
      <h1 className="font-display text-5xl uppercase leading-none text-foreground md:text-7xl">FAQ</h1>
      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <article key={item.q} className="rounded-2xl border border-border bg-card p-5 shadow-[0_8px_22px_rgba(0,0,0,0.09)]">
            <h2 className="text-lg font-semibold text-foreground">{item.q}</h2>
            <p className="mt-2 text-muted">{item.a}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
