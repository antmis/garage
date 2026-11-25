/** Stand-in side profile, used until a real photo is dropped at `public/truck.jpg`. */
export function TruckIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 150" role="img" aria-label="Celestial Silver Tacoma illustration" className={className}>
      <defs>
        <linearGradient id="truck-silver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9dce0" />
          <stop offset="0.55" stopColor="#b3b8bf" />
          <stop offset="1" stopColor="#8e949c" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="132" rx="180" ry="6" fill="currentColor" opacity="0.12" />
      <path
        d="M10 108 L10 66 Q10 60 16 60 L170 60 L186 36 Q190 30 198 30 L262 30 Q270 30 275 36 L296 62 L360 70 Q380 74 385 90 L390 108 Z"
        fill="url(#truck-silver)"
      />
      <path d="M192 40 L259 40 L279 62 L188 62 Z" fill="#2b3138" opacity="0.85" />
      <path d="M226 40 L226 62" stroke="#8e949c" strokeWidth="3" />
      <path d="M10 66 L170 66" stroke="#8e949c" strokeWidth="1.5" opacity="0.6" />
      <rect x="360" y="84" width="22" height="8" rx="3" fill="#f3f4f6" />
      <rect x="383" y="100" width="7" height="8" fill="#5d636b" />
      {[88, 318].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="108" r="31" fill="#1c2026" />
          <circle cx={cx} cy="108" r="25" fill="#2a2f36" />
          <circle cx={cx} cy="108" r="14" fill="#9aa0a8" />
          <circle cx={cx} cy="108" r="5" fill="#5d636b" />
        </g>
      ))}
    </svg>
  )
}
