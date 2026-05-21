import { Link } from "react-router-dom";
import { PRODUCTS } from "@/lib/data";
import Section from "@/components/site/Section";
import Bottle from "@/components/site/Bottle";
import StatusBadge from "@/components/site/StatusBadge";
import { useState } from "react";

const FILTERS = ["All", "In Development", "In Testing", "Coming Soon", "Planned"];

export default function Shop() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.status === filter);

  return (
    <Section eyebrow="The line" title="Products in development." lead="A complete curl-care system, being built ingredient by ingredient. Status is honest — every step is here.">
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTERS.map((f) => (
          <button key={f} data-testid={`shop-filter-${f.toLowerCase().replace(/\s/g, "-")}`} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition border ${filter === f ? "bg-violet-500/20 border-violet-500/40 text-white" : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
        {filtered.map((p) => (
          <Link key={p.slug} to={`/shop/${p.slug}`} data-testid={`shop-card-${p.slug}`} className="group cl-glass rounded-3xl p-8 lg:p-10 hover:border-violet-500/30 transition-all">
            <div className="flex items-start justify-between mb-8">
              <StatusBadge status={p.status} />
            </div>
            <div className="flex justify-center mb-8">
              <Bottle accent={p.accent} label={p.name.split(" ")[0]} />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-white tracking-[-0.02em]">{p.name}</div>
            <p className="mt-3 text-sm text-zinc-400 leading-[1.75] min-h-[48px]">{p.short}</p>
            <div className="mt-7 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Best for: {p.bestFor}</span>
              <span className="text-xs text-violet-300 group-hover:text-violet-200">Learn more →</span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
