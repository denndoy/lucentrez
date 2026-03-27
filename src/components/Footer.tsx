import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card/95 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-2xl tracking-[0.18em] text-foreground">LUCENTREZN</p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Premium Indonesian streetwear label. Explore the latest drop and complete your purchase securely on marketplace.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm text-foreground/85">
            <li><Link href="/catalog">Catalog</Link></li>
            <li><Link href="/#gallery">Lookbook</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Social</p>
          <ul className="mt-3 space-y-2 text-sm text-foreground/85">
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://shopee.co.id" target="_blank" rel="noopener noreferrer">marketplace store</a></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-border py-4 text-center text-xs tracking-widest text-muted">
        © {new Date().getFullYear()} LUCENTREZN. BUILT FOR CULTURE.
      </p>
    </footer>
  );
}
