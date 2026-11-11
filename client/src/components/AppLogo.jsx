import { APP_NAME } from '../lib/constants.js';

// The UI spec says to build the logo as inline SVG plus text, never as a
// remote image (the screenshots show a broken image link for this reason).
export default function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#0b6b5d" />
        {/* house outline */}
        <path
          d="M11 21 L20 13 L29 21 M14 19.5 V28 H26 V19.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* small orange dot at the top right */}
        <circle cx="31" cy="9" r="3.2" fill="#ff7a59" />
      </svg>
      <span className="text-2xl font-bold text-ink">{APP_NAME}</span>
    </div>
  );
}