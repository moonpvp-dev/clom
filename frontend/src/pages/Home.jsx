import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sparkles, Droplets, Wind, Activity, FlaskConical, Microscope, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { api, PRODUCTS } from "@/lib/data";
import Section from "@/components/site/Section";
import Swirl from "@/components/site/Swirl";
import Bottle from "@/components/site/Bottle";
import StatusBadge from "@/components/site/StatusBadge";

const TRUST = [
  { icon: Droplets, label: "Lightweight Feel" },
  { icon: Sparkles, label: "Low Buildup" },
  { icon: Wind, label: "Curl + Perm Friendly" },
  { icon: Activity, label: "Athlete-Aware" },
  { icon: Microscope, label: "In Testing" },
  { icon: FlaskConical, label: "Science-Backed" },
];

const PHILOSOPHY = [
  { title: "Humectants", body: "Pull moisture in. Not just glycerin — the right humectants paired for real climates." },
  { title: "Lightweight emollients", body: "Softness and slip without a heavy film or buildup." },
  { title: "Structuring polymers", body: "Definition, hold, and finish — engineered to break cleanly." },
  { title: "Preservatives", body: "Microbially safe formulas. Non-negotiable for a product on your scalp." },
  { title: "Chelators", body: "Stability against hard water and storage stress." },
  { title: "Low-buildup design", body: "Every ingredient earns its place. No filler. No vanity hero." },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="cl-orb" style={{ width: 500, height: 500, background: "#7C3AED", opacity: 0.3, top: -100, left: -100 }} />
        <div className="cl-orb" style={{ width: 400, height: 400, background: "#581C87", opacity: 0.3, bottom: -100, right: -100 }} />
        <Swirl className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-24 pb-36 lg:pt-40 lg:pb-48 relative">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 cl-glass rounded-full px-5 py-2 mb-9">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-[11px] tracking-[0.3em] uppercase text-zinc-300">Early access open</span>
              </div>

              <h1 data-testid="hero-headline" className="text-5xl sm:text-6xl lg:text-7xl xl:text-[88px] font-bold text-white leading-[1.02] tracking-[-0.035em]">
                Lightweight Curl Care
                <br />
                <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-violet-500 bg-clip-text text-transparent">Built for Real Life.</span>
              </h1>

              <p className="mt-9 text-lg lg:text-xl text-zinc-400 max-w-xl leading-[1.75]">
                CurlLoom is developing performance-focused hair care for curls, waves, coils, perms, and active routines — designed for moisture, definition, and low buildup.
              </p>

              <div className="mt-12 flex flex-wrap gap-4">
                <a href="#early-access" data-testid="hero-cta-primary" className="cl-btn-primary text-white rounded-full px-9 py-5 text-sm font-semibold uppercase">
                  Join Early Access
                </a>
                <Link to="/quiz" data-testid="hero-cta-secondary" className="cl-btn-secondary text-white rounded-full px-9 py-5 text-sm font-semibold uppercase">
                  Take the Curl Quiz
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="cl-orb" style={{ width: 350, height: 350, background: "#8B5CF6", opacity: 0.5, top: 30, left: 30 }} />
                <Bottle size="lg" label="Leave-In" />
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="border-y border-white/5 bg-black/30 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {TRUST.map(({ icon: Icon, label }) => (
              <div key={label} data-testid={`trust-${label.toLowerCase().replace(/\s/g, "-")}`} className="flex items-center gap-3 text-zinc-400">
                <Icon size={16} className="text-violet-400" />
                <span className="text-xs sm:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <Section eyebrow="The problem" title="Curl shouldn't mean compromise." lead="Most curl products force a choice. Some are too heavy. Some leave buildup. Some feel greasy. Some don't last through sweat, wind, or a real day.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[
            { t: "Too heavy", d: "Bricks of butter that flatten waves and second-day curl." },
            { t: "Leaves buildup", d: "Layered residue that dulls definition and irritates scalp." },
            { t: "Greasy finish", d: "Hair that looks oiled, not styled." },
            { t: "Breaks down fast", d: "Sweat, wind, and helmets erase the look by noon." },
          ].map((x) => (
            <div key={x.t} className="cl-glass rounded-3xl p-8 lg:p-10">
              <div className="text-violet-300 text-xs tracking-[0.3em] uppercase mb-4">No thanks</div>
              <div className="text-white font-semibold text-lg lg:text-xl">{x.t}</div>
              <p className="mt-4 text-sm text-zinc-400 leading-[1.75]">{x.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SOLUTION */}
      <Section eyebrow="Our approach" title="Balance, not bulk." lead="CurlLoom is being built to balance hydration, definition, and clean feel — without relying on heavy butters or excessive oils. Each formula is designed to do its job, then get out of the way.">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {[
            { n: "01", t: "Moisture without weight", d: "Humectants and lightweight emollients chosen for slip — not gloss alone." },
            { n: "02", t: "Definition that moves", d: "Polymers tuned to support shape while leaving room for touch." },
            { n: "03", t: "Clean finish, low residue", d: "Designed so a Tuesday workout doesn't unravel Monday's wash day." },
          ].map((x) => (
            <div key={x.n} className="cl-glass-strong rounded-3xl p-10 lg:p-12">
              <div className="text-[11px] tracking-[0.3em] text-violet-300/70">{x.n}</div>
              <div className="mt-5 text-2xl lg:text-3xl font-bold text-white tracking-[-0.02em]">{x.t}</div>
              <p className="mt-5 text-zinc-400 leading-[1.75]">{x.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* PRODUCT PREVIEW */}
      <Section eyebrow="Future products" title="A complete routine, in development." lead="Six products designed to work together. Status shown is honest — some are still in formulation.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
          {PRODUCTS.map((p) => (
            <Link key={p.slug} to={`/shop/${p.slug}`} data-testid={`product-card-${p.slug}`} className="group cl-glass rounded-3xl p-8 lg:p-10 hover:border-violet-500/30 transition-all">
              <div className="flex items-start justify-between mb-8">
                <StatusBadge status={p.status} />
              </div>
              <div className="flex justify-center mb-8">
                <Bottle accent={p.accent} label={p.name.split(" ")[0]} size="sm" />
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

      {/* PHILOSOPHY */}
      <Section eyebrow="Formula philosophy" title="Purpose over hype." lead="CurlLoom isn't built around stuffing a label with trendy ingredients. Each ingredient earns its place — hydration, slip, structure, preservation, stability, or performance.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {PHILOSOPHY.map((p, i) => (
            <div key={p.title} className="cl-glass rounded-3xl p-8 lg:p-10">
              <div className="text-violet-400 text-xs tracking-[0.3em] font-mono">0{i + 1}</div>
              <div className="mt-4 text-lg lg:text-xl font-semibold text-white">{p.title}</div>
              <p className="mt-4 text-sm text-zinc-400 leading-[1.75]">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ATHLETES */}
      <Section className="relative overflow-hidden">
        <div className="cl-orb" style={{ width: 400, height: 400, background: "#7C3AED", opacity: 0.2, top: 0, right: -100 }} />
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[11px] tracking-[0.25em] uppercase text-violet-300 mb-5">Active curls</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">Built with Active Curls in Mind.</h2>
            <p className="mt-6 text-zinc-400 leading-relaxed">
              Sweat, helmets, workouts, wind, and long days can break down styles fast. CurlLoom is exploring formulas that feel clean, perform under movement, and don't leave heavy residue.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {["Sweat-aware", "Helmet-friendly", "Wind-tested mindset", "Refresh-friendly"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> {t}
                </div>
              ))}
            </div>
            <Link to="/athletes" data-testid="link-athletes" className="inline-block mt-8 cl-btn-secondary text-white rounded-full px-6 py-3 text-xs font-semibold tracking-wider uppercase">
              Athletes & Active Curls →
            </Link>
          </div>
          <div className="cl-glass-strong rounded-3xl p-10 relative overflow-hidden">
            <div className="grid grid-cols-3 gap-6">
              {["Sweat", "Helmet", "Wind", "Gym", "All-day", "Refresh"].map((w, i) => (
                <div key={w} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white opacity-90" style={{ opacity: 0.4 + i * 0.1 }}>{w}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* PERM */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 cl-glass-strong rounded-3xl p-10">
            <div className="space-y-4 text-sm">
              {[
                ["Moisture support", "Hydrate without weight"],
                ["Lightweight definition", "Shape that doesn't collapse"],
                ["Avoid buildup", "Keep curl pattern visible"],
                ["Gentle routines", "Designed for chemically-treated strands"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-xs font-bold">✓</div>
                  <div>
                    <div className="text-white font-medium">{k}</div>
                    <div className="text-zinc-400 text-xs mt-1">{v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="text-[11px] tracking-[0.25em] uppercase text-violet-300 mb-5">Perm care</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">Support for Permed Hair.</h2>
            <p className="mt-6 text-zinc-400 leading-relaxed">
              Permed hair often needs moisture, definition, and lightweight control without products that make hair feel greasy or weighed down. CurlLoom is designing routines that support softness and shape.
            </p>
            <Link to="/perm-care" data-testid="link-perm" className="inline-block mt-8 cl-btn-secondary text-white rounded-full px-6 py-3 text-xs font-semibold tracking-wider uppercase">
              Perm Care →
            </Link>
          </div>
        </div>
      </Section>

      {/* TESTING */}
      <Section eyebrow="Testing & safety" title="Transparency, not theater." lead="We don't claim what we haven't done. Here's where CurlLoom is today.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { t: "pH testing", d: "Batch-level pH verification on every formula iteration." },
            { t: "Stability watch", d: "Accelerated stability observation in dev cycles." },
            { t: "Patch test guidance", d: "Customer-facing instructions before launch." },
            { t: "Compliance aware", d: "MoCRA / FDA cosmetic, FTC-compliant claims." },
            { t: "Chemist review", d: "Cosmetic chemist review planned." },
            { t: "Derm-informed", d: "Dermatologist-informed review planned." },
            { t: "Batch records", d: "Internal batch tracking maintained." },
            { t: "No drug claims", d: "Cosmetic product. Not medical." },
          ].map((x) => (
            <div key={x.t} className="cl-glass rounded-2xl p-6">
              <div className="text-white font-semibold">{x.t}</div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-zinc-500 max-w-2xl">
          We do not claim final clinical testing is complete. Formulas may change during development.
        </p>
      </Section>

      {/* EARLY ACCESS FORM */}
      <Section id="early-access" eyebrow="Join the list" title="Get early access." lead="Tell us a bit about your hair. We'll match you to the right routine when products are ready.">
        <EarlyAccessForm />
      </Section>
    </>
  );
}

function EarlyAccessForm() {
  const [form, setForm] = useState({
    name: "", email: "",
    hair_type: "Curly", main_concern: "Moisture",
    is_athlete: false, interested_in_testing: false,
    referred_by: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Capture ?ref=CODE from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setForm((f) => ({ ...f, referred_by: ref.toUpperCase() }));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/early-access", form);
      setResult(data);
      toast.success("You're on the list. Check your inbox.");
    } catch (err) {
      const msg = err?.response?.status === 429
        ? "Too many submissions — try again in a minute."
        : "Something went wrong. Try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/?ref=${result.ref_code}`;
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { toast.error("Couldn't copy"); }
  };

  if (result) {
    const link = `${window.location.origin}/?ref=${result.ref_code}`;
    return (
      <div data-testid="early-access-success" className="cl-glass-strong rounded-3xl p-10 sm:p-12 text-center max-w-2xl mx-auto relative overflow-hidden">
        <div className="cl-orb" style={{ width: 300, height: 300, background: "#8B5CF6", opacity: 0.25, top: -50, left: -50 }} />
        <div className="relative">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300 text-2xl">✓</div>
          <h3 className="text-3xl font-bold text-white">You're #{result.queue_position} on the list.</h3>
          <p className="mt-3 text-zinc-400">Confirmation email is on its way.</p>

          <div className="mt-8 p-6 rounded-2xl bg-violet-500/[0.08] border border-violet-500/30 text-left">
            <div className="text-[11px] tracking-[0.3em] uppercase text-violet-300 mb-3">Founders Circle</div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Share your code. Every signup using it moves you up the queue and earns Founders Circle status at launch.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-stretch gap-2">
              <div data-testid="ref-code" className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-violet-200 text-lg tracking-[0.2em] text-center">
                {result.ref_code}
              </div>
              <button onClick={copyLink} data-testid="ref-copy"
                className="cl-btn-primary text-white rounded-xl px-5 py-3 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2">
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy link</>}
              </button>
            </div>
            <div className="mt-3 text-xs text-zinc-500 break-all">{link}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="cl-glass-strong rounded-3xl p-8 sm:p-10 max-w-3xl mx-auto" data-testid="early-access-form">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Name">
          <input data-testid="ea-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none transition"
            placeholder="Your name" />
        </Field>
        <Field label="Email">
          <input data-testid="ea-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none transition"
            placeholder="you@email.com" />
        </Field>
        <Field label="Hair type">
          <select data-testid="ea-hair-type" value={form.hair_type} onChange={(e) => setForm({ ...form, hair_type: e.target.value })}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none transition">
            {["Straight", "Wavy", "Curly", "Coily", "Permed", "Unsure"].map((t) => <option key={t} className="bg-[#121217]">{t}</option>)}
          </select>
        </Field>
        <Field label="Main concern">
          <select data-testid="ea-concern" value={form.main_concern} onChange={(e) => setForm({ ...form, main_concern: e.target.value })}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none transition">
            {["Moisture", "Hold", "Frizz", "Buildup", "Scalp Comfort", "Definition", "Damage", "Other"].map((t) => <option key={t} className="bg-[#121217]">{t}</option>)}
          </select>
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Toggle testid="ea-athlete" label="Athlete / active lifestyle" value={form.is_athlete} onChange={(v) => setForm({ ...form, is_athlete: v })} />
        <Toggle testid="ea-tester" label="Interested in testing" value={form.interested_in_testing} onChange={(v) => setForm({ ...form, interested_in_testing: v })} />
      </div>

      {form.referred_by && (
        <div className="mt-5 inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-200" data-testid="ea-referred-by">
          <Sparkles size={12} /> Referred by code: <span className="font-mono font-semibold">{form.referred_by}</span>
        </div>
      )}

      <button type="submit" disabled={submitting} data-testid="ea-submit"
        className="mt-8 w-full cl-btn-primary text-white rounded-full px-7 py-4 text-sm font-semibold tracking-wider uppercase disabled:opacity-50">
        {submitting ? "Submitting…" : "Join Early Access"}
      </button>

      <p className="mt-5 text-[11px] text-zinc-500 leading-relaxed">
        By submitting, you agree to receive emails from CurlLoom. We'll never sell your info. Cosmetic products only — not intended to diagnose, treat, cure, or prevent any disease.
      </p>
    </form>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-widest text-zinc-400 mb-2">{label}</div>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange, testid }) {
  return (
    <button type="button" data-testid={testid} onClick={() => onChange(!value)}
      className={`px-4 py-2.5 rounded-full text-xs font-medium transition border ${value ? "bg-violet-500/20 border-violet-500/40 text-white" : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"}`}>
      {value ? "✓ " : ""}{label}
    </button>
  );
}
