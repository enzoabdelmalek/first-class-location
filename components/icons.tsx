/** Pictogrammes au trait, même épaisseur que les silhouettes. */
type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const SeatIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

export const GearIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="6" cy="5" r="2" />
    <circle cx="12" cy="5" r="2" />
    <circle cx="18" cy="5" r="2" />
    <circle cx="6" cy="19" r="2" />
    <circle cx="12" cy="19" r="2" />
    <path d="M6 7v10M12 7v10M18 7v5H6" />
  </svg>
);

export const FuelIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M4 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15M3 20h12M4 10h10M14 8l3 2v7a1.5 1.5 0 0 0 3 0V8l-3-3" />
  </svg>
);

export const BagIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="5" y="7" width="14" height="13" rx="2" />
    <path d="M9 7V4h6v3M9 11v5M15 11v5" />
  </svg>
);

export const ArrowIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const CheckIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const LockIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const PinIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
