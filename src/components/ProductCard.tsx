"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { ProductView } from "@/lib/types";

type ProductCardProps = {
  product: ProductView;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_16px_36px_rgba(0,0,0,0.22)]"
    >
      <Link href={`/catalog/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.images[0] ?? "/products/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <span className="absolute left-3 top-3 rounded-full border border-border bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground">
            {product.category}
          </span>
        </div>

        <div className="space-y-2 p-4">
          <h3 className="font-display text-2xl uppercase leading-none text-foreground">{product.name}</h3>
          <p className="text-sm text-foreground/90">{formatRupiah(product.price)}</p>
          <p className="text-xs uppercase tracking-[0.16em] text-foreground/80">Tap to view and buy on marketplace</p>
        </div>
      </Link>
    </motion.article>
  );
}
