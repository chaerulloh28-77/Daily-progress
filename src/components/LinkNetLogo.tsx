import React, { useId } from 'react';

interface LinkNetLogoProps {
  className?: string;
  variant?: 'full' | 'symbol' | 'compact';
  size?: number;
}

export const LinkNetLogo: React.FC<LinkNetLogoProps> = ({
  className = 'h-8 w-auto',
  variant = 'full',
  size,
}) => {
  const uid = useId().replace(/:/g, '');
  const style = size ? { width: size, height: size } : undefined;

  // 1. Just the Symmetrical Faceted Origami Prism (Symbol Only)
  if (variant === 'symbol') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none ${className}`}
        style={style}
        aria-label="LinkNet Crystal Emblem"
      >
        <defs>
          <linearGradient id={`ln-y1-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFCC00" />
            <stop offset="100%" stopColor="#FDB813" />
          </linearGradient>
          <linearGradient id={`ln-o1-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FA8223" />
            <stop offset="100%" stopColor="#F37021" />
          </linearGradient>
          <linearGradient id={`ln-ro-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F05A28" />
            <stop offset="100%" stopColor="#E63F24" />
          </linearGradient>
          <linearGradient id={`ln-p1-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7B1F69" />
            <stop offset="100%" stopColor="#511757" />
          </linearGradient>
          <linearGradient id={`ln-m1-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A81559" />
            <stop offset="100%" stopColor="#871048" />
          </linearGradient>
          <linearGradient id={`ln-pk-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F02476" />
            <stop offset="100%" stopColor="#D91667" />
          </linearGradient>
        </defs>

        {/* Faceted Prism Triangles */}
        <g transform="translate(10, 8) scale(0.85)">
          {/* Top-Left Yellow Triangle */}
          <polygon points="0,28 36,8 36,48" fill={`url(#ln-y1-${uid})`} />
          {/* Top-Center Orange Triangle */}
          <polygon points="36,8 72,28 36,48" fill={`url(#ln-o1-${uid})`} />
          {/* Top-Right Red-Orange Triangle */}
          <polygon points="72,28 92,39 72,69" fill={`url(#ln-ro-${uid})`} />
          {/* Center Violet/Plum Triangle */}
          <polygon points="36,48 72,28 72,69" fill={`url(#ln-p1-${uid})`} />
          {/* Bottom-Right Berry Crimson Triangle */}
          <polygon points="36,48 72,69 36,89" fill={`url(#ln-m1-${uid})`} />
          {/* Bottom-Left Magenta-Pink Triangle */}
          <polygon points="0,69 36,48 36,89" fill={`url(#ln-pk-${uid})`} />
        </g>
      </svg>
    );
  }

  // 2. Full LinkNet Logo (Wordmark + Signature Gem Emblem)
  return (
    <svg
      viewBox="0 0 320 95"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={style}
      aria-label="LinkNet Logo"
    >
      <defs>
        {/* Gradients for LinkNet brand colors */}
        <linearGradient id={`ln-gold-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFC526" />
          <stop offset="60%" stopColor="#FDB813" />
          <stop offset="100%" stopColor="#F9A602" />
        </linearGradient>

        <linearGradient id={`ln-berry-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C2125A" />
          <stop offset="100%" stopColor="#960A44" />
        </linearGradient>

        {/* Facet gradients */}
        <linearGradient id={`ln-f-y-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFCD1F" />
          <stop offset="100%" stopColor="#FDB813" />
        </linearGradient>
        <linearGradient id={`ln-f-o-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F98024" />
          <stop offset="100%" stopColor="#F0601B" />
        </linearGradient>
        <linearGradient id={`ln-f-ro-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ED4E22" />
          <stop offset="100%" stopColor="#D93517" />
        </linearGradient>
        <linearGradient id={`ln-f-vt-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6C1E62" />
          <stop offset="100%" stopColor="#4A134E" />
        </linearGradient>
        <linearGradient id={`ln-f-m-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A61559" />
          <stop offset="100%" stopColor="#820D45" />
        </linearGradient>
        <linearGradient id={`ln-f-pk-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF2174" />
          <stop offset="100%" stopColor="#D51263" />
        </linearGradient>
      </defs>

      {/* ================= WORDMARK "linknet" ================= */}
      <g fill={`url(#ln-gold-${uid})`}>
        {/* Letter 'l' */}
        <rect x="12" y="41" width="11" height="49" rx="4" />

        {/* Letter 'i' stem */}
        <rect x="30" y="55" width="11" height="35" rx="4" />

        {/* Letter 'n' (first) */}
        <path d="M 48 55 H 58 V 63 C 61 57 66 54 73 54 C 82 54 87 60 87 70 V 90 H 76 V 72 C 76 65 73 63 67 63 C 61 63 58 67 58 74 V 90 H 48 Z" />

        {/* Letter 'k' */}
        <rect x="94" y="41" width="11" height="49" rx="4" />
        <path d="M 105 72 L 122 55 H 136 L 118 71 L 137 90 H 123 L 105 72 Z" />

        {/* Letter 'n' (second) */}
        <path d="M 144 55 H 154 V 63 C 157 57 162 54 169 54 C 178 54 183 60 183 70 V 90 H 172 V 72 C 172 65 169 63 163 63 C 157 63 154 67 154 74 V 90 H 144 Z" />

        {/* Letter 'e' */}
        <path d="M 191 72.5 C 191 61 199 54 211 54 C 223 54 231 62 231 74 V 76 H 202 C 203 82 207 85 214 85 C 219 85 224 83 227 79 L 234 84 C 229 90 221 92 213 92 C 200 92 191 84 191 72.5 Z M 211 61.5 C 206 61.5 203 64.5 202 69.5 H 220 C 219 64.5 216 61.5 211 61.5 Z" />

        {/* Letter 't' stem and hook */}
        <path d="M 240 46 H 251 V 55 H 261 V 63 H 251 V 80 C 251 83 253 85 257 85 C 260 85 262 84 264 83 L 265 91 C 262 92 258 92.5 254 92.5 C 245 92.5 240 88 240 79 V 63 H 234 V 55 H 240 Z" />
      </g>

      {/* Signature Magenta Petal Accent on 'i' dot */}
      <path
        d="M 30.5 50 C 30.5 44 34.5 41 40 41 C 42.5 44 42.5 47 40 50 C 37 53 30.5 53 30.5 50 Z"
        fill={`url(#ln-berry-${uid})`}
      />

      {/* Signature Magenta Petal Accent on 't' crossbar right */}
      <path
        d="M 261 55 C 267 55 272 58 272 61 C 272 63.5 269 64.5 266 64.5 C 262 64.5 261 61 261 55 Z"
        fill={`url(#ln-berry-${uid})`}
      />

      {/* ================= CRYSTAL ORIGAMI PRISM ICON ================= */}
      <g transform="translate(268, 2) scale(0.95)">
        {/* Facet 1: Top-Left Yellow */}
        <polygon points="0,26 33,6 33,44" fill={`url(#ln-f-y-${uid})`} />
        {/* Facet 2: Top-Center Orange */}
        <polygon points="33,6 66,24 33,44" fill={`url(#ln-f-o-${uid})`} />
        {/* Facet 3: Top-Right Deep Red-Orange */}
        <polygon points="66,24 84,34 66,62" fill={`url(#ln-f-ro-${uid})`} />
        {/* Facet 4: Center-Right Deep Plum/Violet */}
        <polygon points="33,44 66,24 66,62" fill={`url(#ln-f-vt-${uid})`} />
        {/* Facet 5: Lower-Center Berry Crimson */}
        <polygon points="33,44 66,62 33,80" fill={`url(#ln-f-m-${uid})`} />
        {/* Facet 6: Bottom-Left Magenta-Pink */}
        <polygon points="0,62 33,44 33,80" fill={`url(#ln-f-pk-${uid})`} />
      </g>
    </svg>
  );
};
