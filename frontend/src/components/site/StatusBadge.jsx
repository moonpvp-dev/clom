const COLORS = {
  "In Development": "from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-200",
  "In Testing": "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-200",
  "Coming Soon": "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-200",
  Planned: "from-zinc-400/15 to-zinc-400/5 border-zinc-400/20 text-zinc-300",
};

export default function StatusBadge({ status, className = "" }) {
  const c = COLORS[status] || COLORS.Planned;
  return (
    <span
      data-testid={`status-${status.toLowerCase().replace(/\s/g, "-")}`}
      className={`inline-flex items-center gap-2 bg-gradient-to-br ${c} border backdrop-blur-md text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full font-medium ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
