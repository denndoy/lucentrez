import Link from "next/link";
import { GalleryGrid } from "@/components/GalleryGrid";
import { HeroSection } from "@/components/HeroSection";
import { ProductGrid } from "@/components/ProductGrid";
import { getFeaturedProducts } from "@/lib/data";
import { GalleryItem } from "@/lib/types";

const landingGalleryItems: GalleryItem[] = [
  {
    id: "lg-1",
    title: "Editorial Rack",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
    createdAt: new Date("2026-01-01"),
  },
  {
    id: "lg-2",
    title: "Street Layering",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80",
    createdAt: new Date("2026-01-02"),
  },
  {
    id: "lg-3",
    title: "Neutral Palette",
    imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80",
    createdAt: new Date("2026-01-03"),
  },
  {
    id: "lg-4",
    title: "Downtown Fit",
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=80",
    createdAt: new Date("2026-01-04"),
  },
  {
    id: "lg-5",
    title: "After Hours",
    imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=80",
    createdAt: new Date("2026-01-05"),
  },
  {
    id: "lg-6",
    title: "City Motion",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80",
    createdAt: new Date("2026-01-06"),
  },
];

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <HeroSection />

      <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <section id="products" className="scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Featured</p>
              <h2 className="mt-2 font-display text-5xl uppercase leading-none text-foreground md:text-6xl">
                Current Heat
              </h2>
            </div>
            <Link
              href="/catalog"
              className="rounded-full border border-border px-5 py-2 text-xs uppercase tracking-[0.14em] text-foreground transition hover:bg-foreground hover:text-background"
            >
              View Full Catalog
            </Link>
          </div>
          <div className="mt-7">
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      </main>

      <section id="about" className="relative mt-16 min-h-[64vh] w-full scroll-mt-28 overflow-hidden border-y border-border shadow-[0_14px_34px_rgba(0,0,0,0.2)] md:mt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=2200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(92deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.62)_40%,rgba(0,0,0,0.38)_72%,rgba(0,0,0,0.22)_100%)]" />

        <div className="relative mx-auto grid h-full w-full max-w-7xl items-center px-5 py-14 md:px-8 md:py-20">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-white/80">Brand Intro</p>
            <h2 className="mt-4 font-display text-5xl uppercase leading-[0.9] text-white md:text-7xl">
              Dress Loud. Move Clean.
            </h2>

            <p className="mt-6 max-w-2xl text-base text-white/90 md:text-2xl md:leading-relaxed">
              Lucentrezn blends statement silhouettes and daily comfort. Built for movement, styled for daily scenes, and ready to checkout on marketplace.
            </p>

            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-white/80">
              Discover Drop → Pick Your Size → Checkout on marketplace
            </p>

            <Link
              href="/#products"
              className="mt-7 inline-flex items-center rounded-sm border border-white bg-white px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-zinc-200"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto mt-16 w-full max-w-7xl space-y-16 px-5 pb-14 md:mt-20 md:px-8 md:pb-14">

        <section id="gallery" className="scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Gallery</p>
              <h2 className="mt-2 font-display text-5xl uppercase leading-none text-foreground md:text-6xl">
                Visual Journal
              </h2>
            </div>
          </div>
          <div className="mt-7">
            <GalleryGrid items={landingGalleryItems} />
          </div>
        </section>
      </main>
    </>
  );
}
