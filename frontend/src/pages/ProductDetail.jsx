import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { getProduct } from "@/lib/data";
import { api } from "@/lib/data";
import Section from "@/components/site/Section";
import Bottle from "@/components/site/Bottle";
import StatusBadge from "@/components/site/StatusBadge";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams();
  const p = getProduct(slug);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (!p) {
    return (
      <Section>
        <div className="text-zinc-400">Product not found. <Link to="/shop" className="text-violet-300">Back to shop</Link></div>
      </Section>
    );
  }

  const join = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await api.post("/waitlist", { email, product_name: p.name });
      setDone(true);
      toast.success(`You're on the ${p.name} waitlist.`);
    } catch {
      toast.error("Try again.");
    }
  };

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Link to="/shop" data-testid="back-to-shop" className="text-zinc-500 hover:text-white text-sm">← All products</Link>

        <div className="mt-8 grid lg:grid-cols-12 gap-12">
          {/* Sticky bottle */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="cl-glass-strong rounded-3xl p-12 flex justify-center items-center relative overflow-hidden min-h-[480px]">
                <div className="cl-orb" style={{ width: 350, height: 350, background: p.accent, opacity: 0.4, top: 50, left: 50 }} />
                <Bottle accent={p.accent} label={p.name.split(" ")[0]} size="lg" />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-7">
            <StatusBadge status={p.status} />
            <h1 data-testid="product-name" className="mt-5 text-4xl sm:text-5xl font-bold text-white leading-tight">CurlLoom {p.name}</h1>
            <p className="mt-4 text-lg text-zinc-400 leading-relaxed">{p.short}</p>

            <div className="mt-10">
              <SubHead>Benefits</SubHead>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <Row label="Who it's for" value={p.who} />
            <Row label="Texture & feel" value={p.feel} />
            <Row label="How to use" value={p.howTo} />

            <div className="mt-10">
              <SubHead>Key ingredient categories</SubHead>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.ingredients.map((i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300">{i}</span>
                ))}
              </div>
            </div>

            <div className="mt-10 p-5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20">
              <div className="text-amber-200 text-xs uppercase tracking-widest font-semibold mb-2">Safety note</div>
              <p className="text-sm text-zinc-400 leading-relaxed">Cosmetic product. External use only. Patch test before regular use. Discontinue if irritation occurs. Not intended to diagnose, treat, cure, or prevent any disease.</p>
            </div>

            {/* Waitlist */}
            <div className="mt-10 cl-glass rounded-3xl p-7">
              {done ? (
                <div data-testid="waitlist-success" className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300">✓</div>
                  <div className="text-white font-semibold">You're on the {p.name} list.</div>
                  <div className="text-sm text-zinc-400 mt-1">We'll email you the moment it's ready.</div>
                </div>
              ) : (
                <form onSubmit={join} data-testid="waitlist-form">
                  <div className="text-xs uppercase tracking-widest text-zinc-400 mb-3">Get notified</div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input data-testid="waitlist-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-full px-5 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none" />
                    <button type="submit" data-testid="waitlist-submit" className="cl-btn-primary text-white rounded-full px-7 py-3 text-xs font-semibold tracking-wider uppercase">
                      Join Waitlist
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubHead({ children }) {
  return <div className="text-xs uppercase tracking-[0.25em] text-violet-300/80 font-semibold">{children}</div>;
}

function Row({ label, value }) {
  return (
    <div className="mt-8 pt-8 border-t border-white/5">
      <SubHead>{label}</SubHead>
      <p className="mt-3 text-zinc-300 leading-relaxed">{value}</p>
    </div>
  );
}
