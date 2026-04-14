"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
};

const SWIPE_THRESHOLD = 40;

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const galleryImages = useMemo(
    () => (images.length > 0 ? images : ["/products/placeholder.svg"]),
    [images],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      const total = galleryImages.length;
      setSelectedIndex(((nextIndex % total) + total) % total);
    },
    [galleryImages.length],
  );

  const goToPrev = useCallback(() => {
    goToIndex(selectedIndex - 1);
  }, [goToIndex, selectedIndex]);

  const goToNext = useCallback(() => {
    goToIndex(selectedIndex + 1);
  }, [goToIndex, selectedIndex]);

  useEffect(() => {
    thumbnailRefs.current[selectedIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedIndex]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX;
    dragDeltaX.current = 0;
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    dragDeltaX.current = event.clientX - dragStartX.current;
  }, []);

  const handlePointerEnd = useCallback(() => {
    if (dragStartX.current === null) return;

    if (dragDeltaX.current <= -SWIPE_THRESHOLD) {
      goToNext();
    } else if (dragDeltaX.current >= SWIPE_THRESHOLD) {
      goToPrev();
    }

    dragStartX.current = null;
    dragDeltaX.current = 0;
  }, [goToNext, goToPrev]);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative overflow-hidden bg-card select-none"
        onPointerDown={galleryImages.length > 1 ? handlePointerDown : undefined}
        onPointerMove={galleryImages.length > 1 ? handlePointerMove : undefined}
        onPointerUp={galleryImages.length > 1 ? handlePointerEnd : undefined}
        onPointerLeave={galleryImages.length > 1 ? handlePointerEnd : undefined}
        onPointerCancel={galleryImages.length > 1 ? handlePointerEnd : undefined}
      >
        <div
          className="flex h-[420px] transition-transform duration-300 ease-out sm:h-[520px] lg:h-[640px]"
          style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
        >
          {galleryImages.map((image, index) => (
            <div key={`${image}-${index}`} className="relative h-full w-full shrink-0">
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center"
                priority={index === 0}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {galleryImages.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={goToPrev}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white/70 backdrop-blur-sm transition hover:bg-black/50 hover:text-white"
            >
              <span className="text-lg leading-none">‹</span>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={goToNext}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white/70 backdrop-blur-sm transition hover:bg-black/50 hover:text-white"
            >
              <span className="text-lg leading-none">›</span>
            </button>
            <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {galleryImages.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    selectedIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/45"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {galleryImages.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              ref={(element) => {
                thumbnailRefs.current[index] = element;
              }}
              onClick={() => goToIndex(index)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden border-2 transition ${
                selectedIndex === index
                  ? "border-white opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
