export default function Swirl({ className = "" }) {
  return (
    <svg className={`cl-swirl ${className}`} viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 100 300 C 200 100, 400 100, 500 300 C 600 500, 400 500, 300 350 C 200 200, 500 200, 700 300"
            stroke="url(#g1)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 50 400 C 250 250, 550 250, 700 400 C 750 480, 500 480, 400 400 C 250 280, 600 280, 750 400"
            stroke="url(#g2)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="800" y2="600">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#581C87" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="800" y2="600">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
