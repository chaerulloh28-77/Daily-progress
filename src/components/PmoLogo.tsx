import React, { useId } from 'react';

interface PmoLogoProps {
  className?: string;
  size?: number;
}

export const PmoLogo: React.FC<PmoLogoProps> = ({ className = 'w-6 h-6', size }) => {
  const uid = useId().replace(/:/g, '');
  const style = size ? { width: size, height: size } : undefined;

  const hexPath = "M 42 18 L 78 18 Q 84 18, 87 23.5 L 102 54.5 Q 105 60, 102 65.5 L 87 96.5 Q 84 102, 78 102 L 42 102 Q 36 102, 33 96.5 L 18 65.5 Q 15 60, 18 54.5 L 33 23.5 Q 36 18, 42 18 Z";

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={style}
      aria-label="PMO MS CKT Symmetrical Vector Logo"
    >
      <defs>
        {/* Symmetrical Hexagon Clip Boundary */}
        <clipPath id={`pmo-clip-${uid}`}>
          <path d={hexPath} />
        </clipPath>

        {/* Premium Cyan Gradients */}
        <linearGradient id={`pmo-cyan-left-${uid}`} x1="15" y1="20" x2="60" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <linearGradient id={`pmo-cyan-right-${uid}`} x1="65" y1="30" x2="105" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* 3D Dark Obsidian Bevel Gradient */}
        <linearGradient id={`pmo-dark-facet-${uid}`} x1="75" y1="18" x2="105" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>

        {/* Dual Dynamic Orange Ribbon Gradients */}
        <linearGradient id={`pmo-orange-1-${uid}`} x1="45" y1="104" x2="66" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>

        <linearGradient id={`pmo-orange-2-${uid}`} x1="58" y1="104" x2="80" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c2410c" />
          <stop offset="45%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fdba74" />
        </linearGradient>

        {/* Metallic Bevel Cap Gradient */}
        <linearGradient id={`pmo-bevel-cap-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Subtle Outer Stroke Gradient */}
        <linearGradient id={`pmo-border-grad-${uid}`} x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#0284c7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Symmetrical Hexagon Base & Content (Clipped for razor-sharp borders) */}
      <g clipPath={`url(#pmo-clip-${uid})`}>
        {/* Background Canvas */}
        <rect x="0" y="0" width="120" height="120" fill="#060c18" />

        {/* 1. Left Wing (Cyan / Sky Blue) */}
        <path
          d="M 15 60 L 33 23.5 Q 36 18, 42 18 L 47 18 C 36 45, 34 72, 47 102 L 42 102 Q 36 102, 33 96.5 L 18 65.5 Q 15 60, 18 54.5 Z"
          fill={`url(#pmo-cyan-left-${uid})`}
        />

        {/* 2. Top-Right 3D Obsidian Bevel Facet */}
        <path
          d="M 68 18 L 78 18 Q 84 18, 87 23.5 L 102 54.5 Q 105 60, 102 65.5 L 94 65.5 C 98 48, 88 30, 68 18 Z"
          fill={`url(#pmo-dark-facet-${uid})`}
        />
        {/* Facet separator hairline */}
        <path
          d="M 87 23.5 L 102 54.5"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />

        {/* 3. Right Wing (Cyan / Sky Blue) */}
        <path
          d="M 94 65.5 L 87 96.5 Q 84 102, 78 102 L 72 102 C 68 85, 74 65, 84 50 C 89 54, 92 60, 94 65.5 Z"
          fill={`url(#pmo-cyan-right-${uid})`}
        />

        {/* Inner Dark Foundation Layer */}
        <path
          d="M 44 18 C 34 46, 32 74, 46 102 L 74 102 C 66 74, 68 46, 82 18 Z"
          fill="#060c18"
        />

        {/* 4. SWOOSH 1 (Left Vibrant Orange Ribbon) */}
        {/* 3D Dark Shadow Edge */}
        <path
          d="M 44.5 104 C 33.5 74, 35.5 45, 57.5 16 L 61 16 C 39 45, 37 74, 48 104 Z"
          fill="#0a0f1d"
        />
        {/* Ribbon Body */}
        <path
          d="M 48 104 C 37 74, 39 45, 60 16 L 68 16 C 47 45, 45 74, 56 104 Z"
          fill={`url(#pmo-orange-1-${uid})`}
        />
        {/* Ribbon Top Bevel Cap */}
        <path
          d="M 60 16 L 68 16 L 69 19.5 L 61 19.5 Z"
          fill={`url(#pmo-bevel-cap-${uid})`}
        />

        {/* 5. SWOOSH 2 (Right Vibrant Orange Ribbon - Parallel) */}
        {/* 3D Dark Shadow Edge */}
        <path
          d="M 57.5 104 C 47.5 74, 49.5 45, 71.5 16 L 75 16 C 53 45, 51 74, 61 104 Z"
          fill="#0a0f1d"
        />
        {/* Ribbon Body */}
        <path
          d="M 61 104 C 51 74, 53 45, 74 16 L 82 16 C 61 45, 59 74, 69 104 Z"
          fill={`url(#pmo-orange-2-${uid})`}
        />
        {/* Ribbon Top Bevel Cap */}
        <path
          d="M 74 16 L 82 16 L 83 19.5 L 75 19.5 Z"
          fill={`url(#pmo-bevel-cap-${uid})`}
        />

        {/* Subtle Specular Highlight Arc on Top (Adds glass/crystal elegance) */}
        <path
          d="M 33 23.5 C 50 14, 70 14, 87 23.5"
          stroke="white"
          strokeWidth="1.2"
          strokeOpacity="0.4"
          strokeLinecap="round"
        />
      </g>

      {/* Symmetrical Outer Beveled Outline */}
      <path
        d={hexPath}
        stroke={`url(#pmo-border-grad-${uid})`}
        strokeWidth="1.6"
        strokeLinejoin="round"
        className="transition-colors"
      />
    </svg>
  );
};
