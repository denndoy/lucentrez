import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
    return { title: "Product Not Found | Lucentrezn" };
  }

  return {
    title: `${product.name} | Lucentrezn`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Lucentrezn`,
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

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section className="grid grid-cols-2 gap-4">
          {product.images.map((image, index) => (
            <div key={image + index} className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border">
              <Image src={image} alt={`${product.name} image ${index + 1}`} fill className="object-cover" />
            </div>
          ))}
        </section>

        <section>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{product.category}</p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-none text-foreground">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-foreground">{formatRupiah(product.price)}</p>
          <p className="mt-5 text-muted">{product.description}</p>

          <div className="mt-7 rounded-xl border border-border bg-card p-4 text-sm text-muted">
            <p className="font-semibold uppercase tracking-[0.16em] text-foreground">Size Info</p>
            <p className="mt-2">Available in S, M, L, XL with relaxed streetwear fit.</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              as="anchor"
              href={product.shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="!bg-black !text-white hover:!bg-zinc-800 border border-black/90 shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
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

      <Link href="/catalog" className="mt-10 inline-block text-sm text-muted underline underline-offset-4">
        Browse more products
      </Link>
    </main>
  );
}
