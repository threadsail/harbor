/** Greek-style galley mark for the Harbor brand. */
export default function HarborLogoMark({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Triangular sail */}
      <path d="M11.2 3.2v11.4L17.8 9.4c-1.8-2.2-3.9-4.3-6.6-6.2z" />
      {/* Mast */}
      <rect x="10.55" y="3" width="1.25" height="13.2" rx="0.4" />
      {/* Hull */}
      <path d="M3.2 16.2h16.4c.35 0 .55.38.35.65-1.35 1.85-4.7 3.35-8.55 3.35S4.6 18.7 3 16.85c-.2-.27 0-.65.2-.65z" />
      {/* Prow curl */}
      <path d="M18.8 16.2c1.15-.15 2.05.05 2.55.55-.95.55-2 .75-3.05.7l.5-1.25z" />
      {/* Water ripple */}
      <path
        d="M4 21.2c1.6-.55 3.2-.2 4.8.15 1.7.4 3.3.25 4.9-.2 1.55-.45 3.15-.4 4.75.15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}
