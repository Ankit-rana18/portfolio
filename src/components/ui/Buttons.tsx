import type { AnchorHTMLAttributes } from "react";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode };

/** Gradient pill used for the main contact call to action. */
export function ContactButton({ children = "Contact Me", className = "", style, ...rest }: LinkProps) {
  return (
    <a
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-xs font-medium uppercase tracking-widest text-white transition-transform duration-200 hover:scale-[1.03] sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base ${className}`}
      style={{
        background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
        boxShadow: "0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset",
        outline: "2px solid #ffffff",
        outlineOffset: "-3px",
        ...style,
      }}
    >
      {children}
    </a>
  );
}

/** Liquid-glass pill for secondary links (projects, resume, socials). */
export function GhostButton({ children, className = "", ...rest }: LinkProps) {
  return (
    <a
      {...rest}
      className={`liquid-glass inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-200 hover:bg-white/10 sm:px-10 sm:py-3.5 sm:text-base ${className}`}
    >
      {children}
    </a>
  );
}
