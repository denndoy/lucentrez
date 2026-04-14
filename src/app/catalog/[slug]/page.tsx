import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { formatRupiah, getAllProducts, getProductBySlug } from "@/lib/data";
import { LANG_COOKIE, normalizeLang } from "@/lib/lang";

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
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value);
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="w-full px-4 py-10 md:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <section>
          <ProductImageGallery images={product.images} productName={product.name} />
        </section>

        <section className="flex flex-col justify-start">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{product.category}</p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-none text-foreground">{product.name}</h1>
          <p className="mt-4 text-3xl font-semibold text-foreground">{formatRupiah(product.price)}</p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">{product.description}</p>

          <p className="mt-6 text-xs uppercase tracking-[0.14em] text-muted">
            {lang === "id" ? "Ukuran tersedia: S / M / L / XL" : "Available sizes: S / M / L / XL"}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              as="anchor"
              href={product.shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="!bg-black !text-white hover:!bg-zinc-800 border border-black/90"
            >
              {lang === "id" ? "Beli di marketplace" : "Buy on marketplace"}
            </Button>
            <Button
              as="link"
              href="/catalog"
              variant="ghost"
              className="!text-foreground hover:!bg-black hover:!text-white"
            >
              {lang === "id" ? "Kembali ke Katalog" : "Back to Catalog"}
            </Button>
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.14em] text-muted">
            {lang === "id"
              ? "Checkout dan pembayaran dilakukan di marketplace."
              : "Checkout and payment are completed on marketplace."}
          </p>
        </section>
      </div>
    </main>
  );
}
