import Image from "next/image";
import { GalleryItem } from "@/lib/types";

type GalleryGridProps = {
  items: GalleryItem[];
};

export function GalleryGrid({ items }: GalleryGridProps) {
  return (
    <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
      {items.map((item, index) => (
        <figure
          key={item.id}
          className="group relative overflow-hidden rounded-2xl border border-border break-inside-avoid"
        >
          <div className={`relative ${index % 3 === 0 ? "aspect-[4/5]" : "aspect-[4/6]"}`}>
            <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
          </div>
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 text-sm text-white">
            {item.title}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
