import Section from "@/components/site/Section";

export default function Testing() {
  return (
    <>
      <Section eyebrow="Testing & safety" title="Transparency from the start." lead="We don't claim what we haven't done. CurlLoom is early-stage. Here's exactly where we are.">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ["External use only", "Products are cosmetic and topical. Not for ingestion."],
            ["Discontinue if irritation", "If redness, itching, burning, or swelling occurs — stop use."],
            ["Not on broken skin", "Don't apply to broken, irritated, or compromised skin."],
            ["Keep away from eyes", "If product contacts eyes, rinse with water."],
            ["Cosmetic only", "Not a medical product. Not intended to diagnose, treat, cure, or prevent any disease."],
            ["Formula versions may change", "We iterate during development. Labels carry batch / version."],
            ["Batch tracking", "Internal batch records are kept for every formulation run."],
            ["Safety review", "Cosmetic chemist and dermatologist-informed review planned before wider distribution."],
          ].map(([t, d]) => (
            <div key={t} className="cl-glass rounded-2xl p-6">
              <div className="text-white font-semibold">{t}</div>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Patch test guide" title="How to patch test." lead="Before regular use of any new cosmetic, perform a patch test. It only takes a day.">
        <ol className="space-y-4 max-w-2xl">
          {[
            "Apply a small amount to inner forearm or behind the ear.",
            "Leave for 24 hours. Don't wash or cover.",
            "Watch for redness, itching, burning, swelling, or irritation.",
            "Discontinue use if any irritation occurs and rinse the area with water.",
          ].map((s, i) => (
            <li key={s} className="flex items-start gap-4 cl-glass rounded-2xl p-5">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-200 text-sm font-bold flex-shrink-0">{i + 1}</div>
              <span className="text-zinc-200 leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div className="cl-glass-strong rounded-3xl p-10">
          <div className="text-[11px] tracking-[0.3em] uppercase text-violet-300 mb-4">Compliance approach</div>
          <h3 className="text-2xl font-bold text-white">MoCRA aware. FTC honest.</h3>
          <p className="mt-4 text-zinc-400 leading-relaxed max-w-3xl">
            CurlLoom is developed with cosmetic regulation in mind — MoCRA / FDA cosmetic compliance is part of the launch checklist, and our marketing language is held to FTC-compliant standards. We do not claim products are clinically tested, dermatologist-approved, or medically active unless and until that is true and clearly documented.
          </p>
        </div>
      </Section>
    </>
  );
}
