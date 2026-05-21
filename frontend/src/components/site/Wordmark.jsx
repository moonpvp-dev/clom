import { Link } from "react-router-dom";

export default function Wordmark({ size = "md", testid = "cl-wordmark" }) {
  const text = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };
  const mark = { sm: 24, md: 32, lg: 44 };
  return (
    <Link to="/" data-testid={testid} className="flex items-center gap-2.5 group">
      <img
        src="/brand/curlloom-logo.png"
        alt="CurlLoom"
        width={mark[size]}
        height={mark[size]}
        className="rounded-full"
        style={{ filter: "drop-shadow(0 0 12px rgba(139,92,246,0.45))" }}
      />
      <span className={`${text[size]} font-bold tracking-tight text-white`}>
        Curl<span className="text-violet-400">Loom</span>
      </span>
    </Link>
  );
}
