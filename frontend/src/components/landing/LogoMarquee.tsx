import type { ReactNode } from "react";

type Brand = { name: string; logo: ReactNode };

/* Each logo is rendered at a uniform height (h-8 md:h-10) so visual weight stays balanced
   across vastly different brand marks. Colors are the official brand hexes. */
const BRANDS: Brand[] = [
  {
    name: "Stripe",
    logo: (
      <div className="inline-flex items-center gap-[12px]" aria-label="Stripe">
        <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
          <path
            fill="#635BFF"
            d="M13.2 3.2c-2.8 0-4.8 1.4-4.8 4.1 0 3.8 4.5 3.6 4.5 5.7 0 1-.8 1.6-2 1.6-1.7 0-3.6-.8-5-1.8v4.2c1.4.8 3.1 1.4 5.4 1.4 3.1 0 5.3-1.7 5.3-4.6 0-4-4.5-3.8-4.5-6 0-.8.7-1.3 1.8-1.3 1.3 0 2.7.5 3.8 1.1V3.9c-1.2-.4-2.5-.7-4.5-.7z"
          />
          <path
            fill="#635BFF"
            opacity="0.9"
            d="M5 8.3c0 4.7 3.6 6.4 7.9 7.7V12c-2.8-.9-4.7-1.8-4.7-4 0-1.4 1-2.4 2.7-2.8 0-1.2.2-2.1.5-2.8C7 2.8 5 4.8 5 8.3z"
          />
        </svg>
        <span className="text-[24px] font-semibold leading-none text-[#635BFF]">Stripe</span>
      </div>
    ),
  },
  {
    name: "Linear",
    logo: (
      <div className="inline-flex items-center gap-[12px]" aria-label="Linear">
        <svg viewBox="0 0 100 100" className="h-6 w-6 shrink-0" aria-hidden="true">
          <defs>
            <linearGradient id="linear-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5E6AD2" />
              <stop offset="100%" stopColor="#26282F" />
            </linearGradient>
          </defs>
          <path
            fill="url(#linear-g)"
            d="M1.22 61.74c-.19-.74.71-1.25 1.25-.71l36.5 36.5c.54.54.03 1.44-.71 1.25A50.04 50.04 0 0 1 1.22 61.74zm-1.2-13.18a.97.97 0 0 0 .28.76l50.38 50.38a.97.97 0 0 0 .76.28 50.46 50.46 0 0 0 7.55-.95L1 41a50.46 50.46 0 0 0-.98 7.56zm3.16-15.32a.99.99 0 0 0 .22 1.09l62.27 62.27a.99.99 0 0 0 1.09.22 50.18 50.18 0 0 0 5.4-2.6L5.78 28.04a50.18 50.18 0 0 0-2.6 5.2zM10.97 22 78 89.03a50.04 50.04 0 0 0 4.04-3.32L14.3 17.96A50.04 50.04 0 0 0 10.97 22zM50 0a50 50 0 0 0-30.13 10.06 1.05 1.05 0 0 0-.1 1.6l68.57 68.57a1.05 1.05 0 0 0 1.6-.1A50 50 0 0 0 50 0z"
          />
        </svg>
        <span className="text-[24px] font-medium leading-none text-[#26282F]">Linear</span>
      </div>
    ),
  },
  {
    name: "Notion",
    logo: (
      <div className="inline-flex items-center gap-[12px]" aria-label="Notion">
        <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
          <path
            d="M4 3.5h14.5L20 5.5V20H4z"
            fill="#fff"
            stroke="#0F0F0F"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M7.2 6.4h8.5l2.3 2.4v9.1H7.2z" fill="none" stroke="#0F0F0F" strokeWidth="0.9" opacity="0.55" />
          <text
            x="11.95"
            y="15"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700"
            fontSize="10.5"
            fill="#0F0F0F"
          >
            N
          </text>
        </svg>
        <span className="text-[24px] font-bold leading-none text-[#0F0F0F]">Notion</span>
      </div>
    ),
  },
  {
    name: "Vercel",
    logo: (
      <svg viewBox="0 0 120 30" className="h-6 md:h-7 w-auto" aria-label="Vercel">
        <polygon points="14,4 26,26 2,26" fill="#000" />
        <text x="32" y="22" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="22" fill="#000">
          Vercel
        </text>
      </svg>
    ),
  },
  {
    name: "Figma",
    logo: (
      <div className="inline-flex items-center gap-[10px]" aria-label="Figma">
        <svg viewBox="0 0 38 57" className="h-7 w-auto shrink-0" aria-hidden="true">
          <path fill="#1ABCFE" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
          <path fill="#0ACF83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
          <path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
          <path fill="#F24E1E" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
          <path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
        </svg>
        <span className="text-[24px] font-medium leading-none text-[#111827]">Figma</span>
      </div>
    ),
  },
  {
    name: "Airbnb",
    logo: (
      <svg viewBox="0 0 140 32" className="h-7 md:h-8 w-auto" aria-label="Airbnb">
        <path
          fill="#FF5A5F"
          d="M16 2a6 6 0 0 0-5.4 3.4C7 12.5 2 21.4 2 25a6 6 0 0 0 10.2 4.3L16 25.6l3.8 3.7A6 6 0 0 0 30 25c0-3.6-5-12.5-8.6-19.6A6 6 0 0 0 16 2zm0 4c.8 0 1.5.4 1.9 1.2C21.3 14 26 22.4 26 25a2 2 0 0 1-3.4 1.4L16 19.9l-6.6 6.5A2 2 0 0 1 6 25c0-2.6 4.7-11 8.1-17.8A2.1 2.1 0 0 1 16 6z"
        />
        <text x="38" y="22" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="20" fill="#FF5A5F">
          airbnb
        </text>
      </svg>
    ),
  },
  {
    name: "Shopify",
    logo: (
      <svg viewBox="0 0 140 32" className="h-7 md:h-8 w-auto" aria-label="Shopify">
        <path
          fill="#95BF47"
          d="M22.5 6.6c0-.2-.2-.3-.3-.3-.2 0-3 .2-3 .2s-2.4-2.3-2.6-2.6c-.3-.3-.8-.2-1-.1-.1 0-.6.2-1.4.4-.8-2.3-2.2-4.4-4.7-4.4h-.2C8.6.2 7.7 1 7 1.8c-2.4.7-4 2.3-4 4.7L0 20l11.6 2.2L22.6 19s-.1-12.4-.1-12.4zm-7 1.8-1.8.6c0-1.2-.2-3-.6-4.4 1.5.3 2.1 2 2.4 3.8zm-3-.5-3.7 1.1c.4-1.4 1.1-2.7 2-3.6.3-.3.7-.6 1.2-.8.5 1 .6 2.4.5 3.3zM10 4l-.4.1c-1.2.6-2.2 1.9-2.7 3.6L4.4 8.5C5 6.4 6.4 4.4 10 4z"
        />
        <path
          fill="#5E8E3E"
          d="M22.2 6.3c-.2 0-3 .2-3 .2s-2.4-2.3-2.6-2.6c-.1-.1-.2-.1-.3-.2v19l9.2-2L22.5 6.6c0-.2-.2-.3-.3-.3z"
        />
        <path
          fill="#FFF"
          d="M14 11.6 12.8 14c-.6-.3-1.2-.5-2.2-.5-1.7 0-1.8 1-1.8 1.3 0 1.5 4 2 4 5.6 0 2.8-1.8 4.6-4.2 4.6-2.9 0-4.4-1.8-4.4-1.8l.8-2.6s1.5 1.3 2.8 1.3c.8 0 1.2-.6 1.2-1.1 0-1.9-3.3-2-3.3-5.4 0-2.7 2-5.4 6-5.4 1.6 0 2.3.5 2.3.5z"
        />
        <text x="32" y="22" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="20" fill="#5E8E3E">
          shopify
        </text>
      </svg>
    ),
  },
  {
    name: "Datadog",
    logo: (
      <svg viewBox="0 0 140 32" className="h-7 md:h-8 w-auto" aria-label="Datadog">
        <path
          fill="#632CA6"
          d="M27 7 24 9l-3-1-3 4-1-2-7 8-1-2-5 7 1 3 3-1v2l3-1v3l3-2 1 2 3-3 2 2 3-4 1 1 4-5-1-1 3-4-1-2zM10 22l-2 1v-2l-2 1 1-3 2-1v2l2-1-1 3z"
        />
        <text x="38" y="22" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="20" fill="#632CA6">
          DATADOG
        </text>
      </svg>
    ),
  },
  {
    name: "Adobe",
    logo: (
      <svg viewBox="0 0 140 32" className="h-7 md:h-8 w-auto" aria-label="Adobe">
        <path fill="#FA0F00" d="M4 4h10v24L4 4zm14 0h10l-10 24V4zM16 14l6 14h-4l-2-5h-4l4-9z" />
        <text x="38" y="22" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="20" fill="#FA0F00">
          Adobe
        </text>
      </svg>
    ),
  },
  {
    name: "Slack",
    logo: (
      <svg viewBox="0 0 140 32" className="h-7 md:h-8 w-auto" aria-label="Slack">
        <g transform="translate(2,4)">
          <rect x="10" y="0" width="4" height="14" rx="2" fill="#36C5F0" />
          <rect x="0" y="10" width="14" height="4" rx="2" fill="#2EB67D" />
          <rect x="10" y="10" width="14" height="4" rx="2" fill="#ECB22E" />
          <rect x="10" y="10" width="4" height="14" rx="2" fill="#E01E5A" />
        </g>
        <text x="34" y="22" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="20" fill="#1D1C1D">
          slack
        </text>
      </svg>
    ),
  },
  {
    name: "Spotify",
    logo: (
      <svg viewBox="0 0 140 32" className="h-7 md:h-8 w-auto" aria-label="Spotify">
        <circle cx="14" cy="16" r="12" fill="#1DB954" />
        <path
          d="M8 12c4-1 9-1 13 1M8 16c3-1 8-1 11 1M9 20c2-.5 6-.5 9 1"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <text x="30" y="22" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="20" fill="#1DB954">
          Spotify
        </text>
      </svg>
    ),
  },
];

type Props = {
  brands?: Brand[];
  /** Seconds per full loop. Smaller = faster. */
  speed?: number;
  label?: string;
};

export function LogoMarquee({ brands = BRANDS, speed = 40, label = "Used by teams at" }: Props) {
  const doubled = [...brands, ...brands];

  return (
    <section className="border-y border-border/50 bg-background py-12 overflow-hidden">
      <p className="text-center text-xs uppercase tracking-[0.22em] text-muted-foreground mb-8">
        {label}
      </p>

      <div
        className="group relative w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <div
          className="flex w-max items-center gap-14 md:gap-20 will-change-transform animate-logo-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ animationDuration: `${speed}s` }}
        >
          {doubled.map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              aria-label={brand.name}
              className="shrink-0 flex items-center justify-center h-10 opacity-80 hover:opacity-100 hover:brightness-110 hover:scale-110 transition-all duration-300 ease-out select-none"
            >
              {brand.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LogoMarquee;