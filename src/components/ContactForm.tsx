type ContactFormProps = {
  whatsappNumber: string;
  instagramUrl: string;
};

export function ContactForm({ whatsappNumber, instagramUrl }: ContactFormProps) {
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;

  return (
    <section className="mt-6 border border-border bg-card">
      <div className="grid gap-0 sm:grid-cols-2">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="group flex min-h-[170px] flex-col items-center justify-center border-b border-border p-6 transition-colors duration-300 hover:bg-zinc-50 sm:border-b-0 sm:border-r"
        >
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-black bg-black text-white">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
            <path d="M20.52 3.48A11.84 11.84 0 0 0 12.04 0C5.52 0 .2 5.32.2 11.84c0 2.08.54 4.1 1.56 5.88L0 24l6.46-1.7a11.8 11.8 0 0 0 5.58 1.42h.01c6.52 0 11.84-5.32 11.84-11.84 0-3.16-1.24-6.12-3.37-8.4ZM12.05 21.7h-.01a9.83 9.83 0 0 1-5-1.36l-.36-.21-3.84 1.01 1.03-3.74-.23-.38a9.78 9.78 0 0 1-1.5-5.18c0-5.43 4.42-9.84 9.86-9.84 2.63 0 5.09 1.02 6.95 2.88a9.78 9.78 0 0 1 2.89 6.96c0 5.43-4.42 9.85-9.79 9.86Zm5.4-7.35c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.36.23-.66.08-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.61.14-.14.3-.36.45-.54.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.94-2.24-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.44.25-.71.25-1.32.18-1.44-.08-.12-.28-.2-.58-.35Z" />
            </svg>
          </span>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-foreground">WhatsApp</p>
        </a>

        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="group flex min-h-[170px] flex-col items-center justify-center p-6 transition-colors duration-300 hover:bg-zinc-50"
        >
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-foreground">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
              <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-foreground">Instagram</p>
        </a>
      </div>
    </section>
  );
}
