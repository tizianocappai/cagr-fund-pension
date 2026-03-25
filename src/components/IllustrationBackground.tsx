/**
 * IllustrationBackground - Decorative background elements for Illustration style
 *
 * Adds playful, hand-drawn style decorations:
 * - Clouds
 * - Stars
 * - Geometric shapes
 * - Doodles
 *
 * All elements are:
 * - Fixed positioned with -z-10 (behind content)
 * - Low opacity (10-15%) to avoid distraction
 * - Pointer-events-none to prevent interaction
 */

export function IllustrationBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Cloud - Top Right */}
      <svg
        className="absolute top-10 right-20 w-48 opacity-10"
        viewBox="0 0 200 100"
        aria-hidden="true"
      >
        <path
          d="M50,50 Q30,30 50,20 Q70,10 80,20 Q100,15 110,25 Q120,20 130,30 Q140,25 145,35 Q150,50 130,60 Q110,65 90,60 Q70,70 50,50 Z"
          fill="#BBE0EF"
          stroke="#161E54"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Star - Bottom Left */}
      <svg
        className="absolute bottom-20 left-10 w-24 opacity-12"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path
          d="M50,10 L58,38 L88,38 L64,56 L72,84 L50,66 L28,84 L36,56 L12,38 L42,38 Z"
          fill="#F16D34"
          stroke="#161E54"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Circle - Top Left */}
      <svg
        className="absolute top-32 left-16 w-20 opacity-10"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#BBE0EF"
          strokeWidth="3"
          strokeDasharray="8 4"
        />
      </svg>

      {/* Triangle - Bottom Right */}
      <svg
        className="absolute bottom-32 right-16 w-28 opacity-12"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path
          d="M50,10 L90,80 L10,80 Z"
          fill="none"
          stroke="#F16D34"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Squiggle - Middle Right */}
      <svg
        className="absolute top-1/2 right-8 w-16 opacity-10"
        viewBox="0 0 40 120"
        aria-hidden="true"
      >
        <path
          d="M20,10 Q10,30 20,50 Q30,70 20,90 Q10,110 20,120"
          fill="none"
          stroke="#161E54"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Dots pattern - Top Middle */}
      <svg
        className="absolute top-24 left-1/2 -translate-x-1/2 w-32 opacity-10"
        viewBox="0 0 100 50"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="4" fill="#BBE0EF" />
        <circle cx="50" cy="15" r="5" fill="#F16D34" />
        <circle cx="80" cy="25" r="3" fill="#161E54" />
        <circle cx="35" cy="35" r="4" fill="#BBE0EF" />
        <circle cx="65" cy="40" r="3" fill="#F16D34" />
      </svg>

      {/* Pencil doodle - Middle Left */}
      <svg
        className="absolute top-1/3 left-12 w-20 opacity-12 rotate-12"
        viewBox="0 0 60 100"
        aria-hidden="true"
      >
        <rect
          x="22"
          y="10"
          width="16"
          height="60"
          fill="#F16D34"
          stroke="#161E54"
          strokeWidth="1.5"
          rx="2"
        />
        <path
          d="M22,70 L30,85 L38,70 Z"
          fill="#161E54"
        />
        <rect
          x="25"
          y="5"
          width="10"
          height="10"
          fill="#FFE5B4"
          stroke="#161E54"
          strokeWidth="1.5"
          rx="1"
        />
      </svg>

      {/* Small cloud - Bottom Middle */}
      <svg
        className="absolute bottom-16 left-1/3 w-32 opacity-10"
        viewBox="0 0 150 80"
        aria-hidden="true"
      >
        <path
          d="M40,40 Q30,25 40,20 Q50,15 60,20 Q70,18 75,25 Q80,22 85,28 Q88,40 78,48 Q65,52 50,48 Q35,52 40,40 Z"
          fill="#BBE0EF"
          stroke="#161E54"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wave pattern - Bottom Right (subtle) */}
      <svg
        className="absolute bottom-8 right-1/4 w-40 opacity-8"
        viewBox="0 0 120 40"
        aria-hidden="true"
      >
        <path
          d="M0,20 Q15,10 30,20 Q45,30 60,20 Q75,10 90,20 Q105,30 120,20"
          fill="none"
          stroke="#BBE0EF"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
