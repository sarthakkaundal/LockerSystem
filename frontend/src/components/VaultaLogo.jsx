/**
 * VaultaLogo — a clean, inline SVG logo for the Vaulta brand.
 * Inspired by the YC aesthetic: bold, minimal, orange accent.
 *
 * Props:
 *   size      – height in px (default 32)
 *   showText  – render the "Vaulta" wordmark beside the icon (default true)
 *   dark      – use white text for dark backgrounds (default false)
 *   className – extra classes on the wrapper
 *   iconOnly  – only render the square icon mark (default false)
 */
export default function VaultaLogo({
  size = 32,
  showText = true,
  dark = false,
  className = "",
  iconOnly = false,
}) {
  const textColor = dark ? "#ffffff" : "#111111";

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Orange square background */}
      <rect width="40" height="40" rx="4" fill="#f97316" />
      {/* "V" letter mark */}
      <path
        d="M12 10L20 30L28 10"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Small lock detail */}
      <rect x="17" y="20" width="6" height="5" rx="1" fill="white" opacity="0.85" />
      <path
        d="M18.5 20V18C18.5 16.9 19.18 16 20 16C20.82 16 21.5 16.9 21.5 18V20"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );

  if (iconOnly) {
    return <span className={className}>{icon}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {icon}
      {showText && (
        <span
          className="font-bold tracking-tight"
          style={{ fontSize: size * 0.7, color: textColor, lineHeight: 1 }}
        >
          Vaulta
        </span>
      )}
    </span>
  );
}
