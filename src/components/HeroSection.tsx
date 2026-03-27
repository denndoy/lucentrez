"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[72vh] w-full overflow-hidden border-y border-border bg-black shadow-[0_14px_34px_rgba(0,0,0,0.22)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2200&q=80')",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(92deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.58)_42%,rgba(0,0,0,0.35)_72%,rgba(0,0,0,0.25)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_28%,rgba(255,255,255,0.16),transparent_38%)]" />

      <div className="relative mx-auto grid h-full w-full max-w-7xl items-center px-5 py-16 md:px-8 md:py-20">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.28em] text-white/80"
          >
            New Arrival 2026
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 max-w-4xl font-display text-5xl uppercase leading-[0.9] text-white md:text-8xl"
          >
            #YourDailyWear
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-2xl text-base text-white/90 md:text-3xl"
          >
            Everyday essential pieces with clean silhouettes that are easy to style and reliable for daily movement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link
              href="/catalog"
              className="inline-flex items-center rounded-sm border border-white bg-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-zinc-200"
            >
              New Arrivals
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
