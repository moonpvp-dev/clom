import { Link } from "react-router-dom";

export default function Wordmark({ size = "md", testid = "cl-wordmark" }) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };
  return (
    <Link to="/" data-testid={testid} className="flex items-center gap-2 group">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-violet-400">
        <path d="M14 4 C8 6, 6 14, 14 14 C22 14, 20 22, 14 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="14" r="2.5" fill="currentColor" opacity="0.6" />
      </svg>
      <span className={`${sizes[size]} font-bold tracking-tight text-white`}>
        Curl<span className="text-violet-400">Loom</span>
      </span>
    </Link>
  );
}
