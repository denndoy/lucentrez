"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroSlide } from "@/lib/types";

type HomeHeroSliderProps = {
  lang: "id" | "en";
  slides: HeroSlide[];
};

export function HomeHeroSlider({ lang, slides }: HomeHeroSliderProps) {
  const safeSlides = useMemo(() => (slides.length > 0 ? slides : []), [slides]);
  const trackSlides = useMemo(() => {
    if (safeSlides.length <= 1) return safeSlides;
    return [safeSlides[safeSlides.length - 1], ...safeSlides, safeSlides[0]];
  }, [safeSlides]);

  const [displayIndex, setDisplayIndex] = useState(safeSlides.length > 1 ? 1 : 0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isInstantJump, setIsInstantJump] = useState(false);
  const sliderRef = useRef<HTMLElement | null>(null);
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);
  const lastMoveX = useRef<number | null>(null);
  const lastMoveTime = useRef<number | null>(null);
  const swipeVelocity = useRef(0);
  const isDragging = useRef(false);

  const active = safeSlides.length <= 1
    ? 0
    : ((displayIndex - 1 + safeSlides.length) % safeSlides.length);

  function goNext() {
    if (safeSlides.length <= 1) return;
    setDisplayIndex((current) => current + 1);
  }

  function goPrev() {
    if (safeSlides.length <= 1) return;
    setDisplayIndex((current) => current - 1);
  }

  function onDragStart(clientX: number) {
    if (safeSlides.length <= 1) return;
    isDragging.current = true;
    dragStartX.current = clientX;
    dragDeltaX.current = 0;
    lastMoveX.current = clientX;
    lastMoveTime.current = Date.now();
    swipeVelocity.current = 0;
    setDragOffset(0);
    setIsPointerDown(true);
  }

  function onDragMove(clientX: number) {
    if (!isDragging.current || dragStartX.current === null) return;
    const now = Date.now();
    if (lastMoveX.current !== null && lastMoveTime.current !== null) {
      const dt = Math.max(1, now - lastMoveTime.current);
      const dx = clientX - lastMoveX.current;
      const instantVelocity = dx / dt;
      // Smooth the velocity so inertial swipe feels stable.
      swipeVelocity.current = swipeVelocity.current * 0.7 + instantVelocity * 0.3;
    }
    lastMoveX.current = clientX;
    lastMoveTime.current = now;

    const rawDelta = clientX - dragStartX.current;
    const width = sliderRef.current?.clientWidth ?? 1;
    const limitedDelta = Math.max(Math.min(rawDelta, width * 0.9), -width * 0.9);
    dragDeltaX.current = limitedDelta;
    setDragOffset(limitedDelta);
  }

  function onDragEnd() {
    if (!isDragging.current) return;

    const width = sliderRef.current?.clientWidth ?? 1;
    const threshold = Math.max(50, width * 0.14);
    const velocityThreshold = 0.45;

    if (dragDeltaX.current <= -threshold || swipeVelocity.current <= -velocityThreshold) {
      goNext();
    } else if (dragDeltaX.current >= threshold || swipeVelocity.current >= velocityThreshold) {
      goPrev();
    }

    isDragging.current = false;
    dragStartX.current = null;
    dragDeltaX.current = 0;
    lastMoveX.current = null;
    lastMoveTime.current = null;
    swipeVelocity.current = 0;
    setDragOffset(0);
    setIsPointerDown(false);
  }

  const dragPercent = sliderRef.current?.clientWidth
    ? (dragOffset / sliderRef.current.clientWidth) * 100
    : 0;

  useEffect(() => {
    if (safeSlides.length <= 1) return;
    if (isPointerDown || isHovering) return;

    const timer = setInterval(() => {
      goNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [isHovering, isPointerDown, safeSlides.length]);

  useEffect(() => {
    if (safeSlides.length === 0) return;
    setDisplayIndex(safeSlides.length > 1 ? 1 : 0);
  }, [safeSlides.length]);

  useEffect(() => {
    if (!isInstantJump) return;

    const frame = requestAnimationFrame(() => {
      setIsInstantJump(false);
    });

    return () => cancelAnimationFrame(frame);
  }, [isInstantJump]);

  function onTrackTransitionEnd() {
    if (safeSlides.length <= 1) return;

    if (displayIndex === safeSlides.length + 1) {
      setIsInstantJump(true);
      setDisplayIndex(1);
    } else if (displayIndex === 0) {
      setIsInstantJump(true);
      setDisplayIndex(safeSlides.length);
    }
  }

  if (safeSlides.length === 0) {
    return (
      <section className="relative min-h-[calc(100vh-84px)] overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#262626_0%,#171717_45%,#0a0a0a_100%)]">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex min-h-[calc(100vh-84px)] flex-col items-center justify-center gap-5 px-6 text-center">
          <p className="max-w-xl text-xs uppercase tracking-[0.2em] text-white/70">
            {lang === "id" ? "Slider landing belum memiliki gambar" : "Landing slider has no images yet"}
          </p>
          <Link
            href="/catalog"
            className="relative inline-flex h-9 min-h-9 shrink-0 select-none items-center justify-center gap-2 rounded-full border border-white bg-transparent px-5 text-center text-xs font-semibold uppercase tracking-[0.18em] !text-white transition-[background-color,border-color,filter] duration-150 ease-in-out hover:border-white/90 hover:bg-white/18 hover:!text-white hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {lang === "id" ? "BELANJA" : "SHOP HERE"}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sliderRef}
      className="relative min-h-[calc(100vh-84px)] overflow-hidden touch-pan-y"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onDragStart(event.clientX);
      }}
      onPointerMove={(event) => onDragMove(event.clientX)}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
      onPointerLeave={onDragEnd}
    >
      <div
        className="absolute inset-0 flex"
        onTransitionEnd={onTrackTransitionEnd}
        style={{
          transform: `translateX(calc(${-displayIndex * 100}% + ${dragPercent}%))`,
          transition:
            isPointerDown || isInstantJump
              ? "none"
              : "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {trackSlides.map((slide, index) => (
          <div key={`${slide.id}-${index}`} className="relative h-full min-h-[calc(100vh-84px)] w-full shrink-0 grow-0 basis-full">
            <Image
              src={slide.imageUrl}
              alt={slide.title || "Lucentrez hero"}
              className="left-0 top-0 h-full w-full object-cover absolute"
              fill
              priority={index <= 1}
              sizes="100vw"
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex min-h-[calc(100vh-84px)] items-center justify-center px-6">
        <Link
          href="/catalog"
          className="relative inline-flex h-9 min-h-9 shrink-0 select-none items-center justify-center gap-2 rounded-full border border-white bg-transparent px-5 text-center text-xs font-semibold uppercase tracking-[0.18em] !text-white transition-[background-color,border-color,filter] duration-150 ease-in-out hover:border-white/90 hover:bg-white/18 hover:!text-white hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {lang === "id" ? "BELANJA" : "SHOP HERE"}
        </Link>
      </div>

      {safeSlides.length > 1 ? (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {safeSlides.map((slide, index) => (
            <button
              key={`${slide.id}-dot`}
              type="button"
              onClick={() => setDisplayIndex(index + 1)}
              className={`h-2.5 w-2.5 rounded-full border border-white/70 ${index === active ? "bg-white" : "bg-transparent"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
