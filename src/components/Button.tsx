import Link from "next/link";
import { ComponentPropsWithoutRef } from "react";

type ButtonProps = {
  variant?: "primary" | "ghost";
  as?: "button" | "link" | "anchor";
  href?: string;
} & ComponentPropsWithoutRef<"button"> &
  ComponentPropsWithoutRef<"a">;

export function Button({
  children,
  className,
  variant = "primary",
  as = "button",
  href,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition-all duration-300";
  const styles =
    variant === "primary"
      ? "bg-foreground text-background shadow-[0_12px_28px_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
      : "border border-border text-foreground hover:bg-foreground hover:text-background";

  if (as === "link" && href) {
    return (
      <Link href={href} className={`${base} ${styles} ${className ?? ""}`}>
        {children}
      </Link>
    );
  }

  if (as === "anchor" && href) {
    return (
      <a href={href} className={`${base} ${styles} ${className ?? ""}`} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={`${base} ${styles} ${className ?? ""}`} {...props}>
      {children}
    </button>
  );
}
