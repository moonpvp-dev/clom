import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProduct, api } from "@/lib/data";
import Section from "@/components/site/Section";
import Bottle from "@/components/site/Bottle";
import StatusBadge from "@/components/site/StatusBadge";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchProduct(slug).then(setP).catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <Section>
        <div className="text-zinc-400">Product not found. <Link to="/shop" className="text-violet-300">Back to shop</Link></div>
      </Section>
    );
  }

  if (!p) {
    return <Section><div className="text-zinc-500">Loading…</div></Section>;
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
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <Link to="/shop" data-testid="back-to-shop" className="text-zinc-500 hover:text-white text-sm">← All products</Link>

        <div className="mt-10 grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <div className="cl-glass-strong rounded-3xl p-12 flex justify-center items-center relative overflow-hidden min-h-[520px]">
                <div className="cl-orb" style={{ width: 350, height: 350, background: p.accent, opacity: 0.4, top: 50, left: 50 }} />
                <Bottle accent={p.accent} label={p.name.split(" ")[0]} size="lg" image={p.image} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <StatusBadge status={p.status} />
            <h1 data-testid="product-name" className="mt-6 text-4xl sm:text-5xl font-bold text-white leading-tight tracking-[-0.025em]">CurlLoom {p.name}</h1>
            <p className="mt-5 text-lg text-zinc-400 leading-[1.75]">{p.short}</p>

            {p.benefits?.length > 0 && (
              <div className="mt-12">
                <SubHead>Benefits</SubHead>
                <ul className="mt-5 grid sm:grid-cols-2 gap-4">
                  {p.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-zinc-300 leading-[1.75]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {p.who && <Row label="Who it's for" value={p.who} />}
            {p.feel && <Row label="Texture & feel" value={p.feel} />}
            {p.howTo && <Row label="How to use" value={p.howTo} />}

            {p.ingredients?.length > 0 && (
              <div className="mt-12">
                <SubHead>Key ingredient categories</SubHead>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.ingredients.map((i) => (
                    <span key={i} className="text-xs px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300">{i}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 p-6 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20">
              <div className="text-amber-200 text-xs uppercase tracking-[0.25em] font-semibold mb-2">Safety note</div>
              <p className="text-sm text-zinc-400 leading-[1.75]">Cosmetic product. External use only. Patch test before regular use. Discontinue if irritation occurs. Not intended to diagnose, treat, cure, or prevent any disease.</p>
            </div>

            <div className="mt-12 cl-glass rounded-3xl p-8">
              {done ? (
                <div data-testid="waitlist-success" className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300">✓</div>
                  <div className="text-white font-semibold">You're on the {p.name} list.</div>
                  <div className="text-sm text-zinc-400 mt-2">We'll email you the moment it's ready.</div>
                </div>
              ) : (
                <form onSubmit={join} data-testid="waitlist-form">
                  <div className="text-xs uppercase tracking-[0.25em] text-zinc-400 mb-4">Get notified</div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input data-testid="waitlist-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-full px-6 py-4 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none" />
                    <button type="submit" data-testid="waitlist-submit" className="cl-btn-primary text-white rounded-full px-8 py-4 text-xs font-semibold uppercase">
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
  return <div className="text-xs uppercase tracking-[0.3em] text-violet-300/80 font-semibold">{children}</div>;
}

function Row({ label, value }) {
  return (
    <div className="mt-10 pt-10 border-t border-white/5">
      <SubHead>{label}</SubHead>
      <p className="mt-4 text-zinc-300 leading-[1.75]">{value}</p>
    </div>
  );
}
