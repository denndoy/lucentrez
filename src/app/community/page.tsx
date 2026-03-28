import type { Metadata } from "next";
import Image from "next/image";
import { getGalleryItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Community",
  description: "Simple community lookbook in a clean 3-column gallery layout.",
};

export default async function CommunityPage() {
  const items = await getGalleryItems();

  return (
    <section className="w-full px-4 py-5 md:px-10 md:py-8 lg:px-14">
      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">No community images yet.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <figure key={`${item.id}-${index}`} className="relative overflow-hidden bg-card">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={item.imageUrl}
                alt={item.title || `Community ${index + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
