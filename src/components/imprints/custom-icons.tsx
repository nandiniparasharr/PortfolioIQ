/**
 * Monochrome line icons for artifacts that Lucide doesn't ship, drawn to match
 * Lucide's conventions: 24×24 viewBox, no fill, currentColor stroke, width 2,
 * round caps/joins. Each accepts a className so it sizes/colors like a Lucide
 * icon in the artifact registry.
 */
import * as React from "react";

type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ChessPawn({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="6" r="2.5" />
      <path d="M10 8.5c0 1.6.8 2.4-.5 4.5-.8 1.3-1.5 2.5-1.5 4h8c0-1.5-.7-2.7-1.5-4-1.3-2.1-.5-2.9-.5-4.5" />
      <path d="M6.5 21h11l-1-4h-9z" />
    </Svg>
  );
}

export function ChessKnight({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 21h10" />
      <path d="M9 21c0-2.2 0-4-1-5.5" />
      <path d="M8 15.5C6.5 14 6 12.5 6.5 10.8 7 9 8.5 8 10 6.7L11.5 4l1.3 1-.9 1.7c2.1-.3 4 .8 4.7 3 .8 2.4.6 5-.1 7.8" />
      <path d="M9.5 9.2 8 10.5" />
    </Svg>
  );
}

export function Spyglass({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m3 21 4.5-4.5" />
      <path d="M6.5 15.5 15 7a2.5 2.5 0 0 1 3.5 0l.5.5" />
      <path d="M9 18l8.5-8.5a2.5 2.5 0 0 0 0-3.5" />
      <circle cx="18" cy="6" r="2.2" />
    </Svg>
  );
}

export function Sundial({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 19h18" />
      <path d="M7 19 12 8l1.5 11" />
      <path d="M12 8V4" />
      <path d="M9 16.5h4" />
      <path d="M10.5 12.5h2.2" />
    </Svg>
  );
}

export function BinderClip({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 8h12l-1.4 10.2a2 2 0 0 1-2 1.8H9.4a2 2 0 0 1-2-1.8z" />
      <path d="M8.5 8 9.4 5h5.2l.9 3" />
      <path d="M10.5 12h3" />
    </Svg>
  );
}

export function Abacus({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M4 10h16" />
      <path d="M4 15h16" />
      <circle cx="8" cy="7" r="1" />
      <circle cx="12" cy="7" r="1" />
      <circle cx="10" cy="12.5" r="1" />
      <circle cx="15" cy="12.5" r="1" />
      <circle cx="9" cy="17.5" r="1" />
      <circle cx="14" cy="17.5" r="1" />
    </Svg>
  );
}

export function InkBottle({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M9 3h6v3H9z" />
      <path d="M7 6h10" />
      <path d="M8 6v3.5A5 5 0 0 0 8 18h8a5 5 0 0 0 0-8.5V6" />
      <path d="M11 12h2" />
    </Svg>
  );
}

export function FullMoon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="9" r="1.3" />
      <circle cx="14.5" cy="13" r="1.8" />
      <circle cx="10" cy="15" r="1" />
    </Svg>
  );
}

export function Saturn({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="4.5" />
      <ellipse cx="12" cy="12" rx="10" ry="3.4" transform="rotate(-22 12 12)" />
    </Svg>
  );
}

export function Comet({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="16.5" cy="7.5" r="3" />
      <path d="m14 10-9 9" />
      <path d="M13 13 8 18" />
      <path d="M16 13.5 12 17.5" />
    </Svg>
  );
}

export function Constellation({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m5 6 5 4 5-5 4 7-9 3z" />
      <circle cx="5" cy="6" r="1" />
      <circle cx="10" cy="10" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="10" cy="15" r="1" />
    </Svg>
  );
}
