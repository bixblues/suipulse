interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <div className={className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pulse Wave Animation */}
        <path
          className="animate-pulse-wave"
          d="M16 4C9.372 4 4 9.372 4 16c0 6.627 5.372 12 12 12"
          stroke="url(#pulse-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Circular Path */}
        <path
          d="M16 4c6.627 0 12 5.373 12 12s-5.373 12-12 12"
          stroke="url(#circle-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Center Dot */}
        <circle
          cx="16"
          cy="16"
          r="3"
          className="animate-pulse"
          fill="url(#dot-gradient)"
        />

        {/* Gradients */}
        <defs>
          <linearGradient
            id="pulse-gradient"
            x1="4"
            y1="16"
            x2="28"
            y2="16"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          <linearGradient
            id="circle-gradient"
            x1="16"
            y1="4"
            x2="16"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          <radialGradient
            id="dot-gradient"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(16 16) rotate(90) scale(3)"
          >
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#7C3AED" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
