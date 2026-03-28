import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { formatRupiah, getAllProducts, getProductBySlug } from "@/lib/data";

type ProductDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found | Lucentrez" };
  }

  return {
    title: `${product.name} | Lucentrez`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Lucentrez`,
      description: product.description,
      images: [{ url: product.images[0] ?? "/products/placeholder.svg" }],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const mainImage = product.images[0] ?? "/products/placeholder.svg";

  return (
    <main className="w-full px-4 py-10 md:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <section>
          <div className="relative h-[420px] overflow-hidden bg-card sm:h-[520px] lg:h-[640px]">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center"
            />
          </div>
        </section>

        <section className="flex flex-col justify-start">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{product.category}</p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-none text-foreground">{product.name}</h1>
          <p className="mt-4 text-3xl font-semibold text-foreground">{formatRupiah(product.price)}</p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">{product.description}</p>

          <p className="mt-6 text-xs uppercase tracking-[0.14em] text-muted">Available sizes: S / M / L / XL</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              as="anchor"
              href={product.shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="!bg-black !text-white hover:!bg-zinc-800 border border-black/90"
            >
              Buy on marketplace
            </Button>
            <Button
              as="link"
              href="/catalog"
              variant="ghost"
              className="!text-foreground hover:!bg-black hover:!text-white"
            >
              Back to Catalog
            </Button>
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.14em] text-muted">
            Checkout and payment are completed on marketplace.
          </p>
        </section>
      </div>
    </main>
  );
}
