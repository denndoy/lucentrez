"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import type { CatalogGridItem } from "@/components/ProductGrid";

type ProductCardProps = {
  product: CatalogGridItem;
};

export function ProductCard({ product }: ProductCardProps) {
  const soldOut = !product.inStock;
  const [isHovered, setIsHovered] = useState(false);
  
  const hasHoverImage = product.hoverImage && product.hoverImage.trim() !== "";

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group overflow-hidden bg-transparent"
    >
      <Link href={`/catalog/${product.slug}`}>
        <div className="relative h-[320px] w-full overflow-hidden bg-zinc-100 sm:h-[360px] lg:h-[420px]">
          {/* Main image */}
          <Image
            src={product.images[0] ?? "/products/placeholder.svg"}
            alt={product.name}
            fill
            className={`object-cover object-center transition-opacity duration-500 ease-in-out ${soldOut ? "blur-[0.8px] saturate-75 brightness-90" : ""} ${hasHoverImage && isHovered ? "opacity-0" : "opacity-100"}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          {/* Hover image */}
          {hasHoverImage && (
            <Image
              src={product.hoverImage!}
              alt={`${product.name} hover`}
              fill
              className={`object-cover object-center transition-opacity duration-500 ease-in-out ${soldOut ? "blur-[0.8px] saturate-75 brightness-90" : ""} ${isHovered ? "opacity-100" : "opacity-0"}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          )}
          {soldOut ? (
            <span className="absolute left-3 top-3 bg-foreground px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-background">
              Sold Out
            </span>
          ) : null}
        </div>

        <div className={`space-y-1 py-4 ${soldOut ? "opacity-60" : "opacity-100"}`}>
          <h3 className="font-display text-4xl uppercase leading-none text-foreground">{product.name}</h3>
          <p className="text-2xl font-semibold text-foreground">{formatRupiah(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}
