import Section from "@/components/site/Section";
import { Link } from "react-router-dom";

export default function PermCare() {
  return (
    <Section eyebrow="Perm care" title="Support for permed hair." lead="Permed hair often needs moisture, definition, and lightweight control — without products that make it feel greasy or weighed down. CurlLoom is designing routines that support softness and shape.">
      <div className="grid sm:grid-cols-2 gap-5">
        {[
          ["Moisture support", "Chemically-styled strands need consistent, light hydration."],
          ["Lightweight definition", "Shape without piling product on top of product."],
          ["Avoid heavy buildup", "Permed pattern stays visible — not buried."],
          ["Gentle routines", "Cleansing and conditioning steps that don't strip."],
          ["Styling support", "Cream and gel options for soft to medium hold."],
          ["Education first", "Real info on care, not gimmicks."],
        ].map(([t, d]) => (
          <div key={t} className="cl-glass rounded-3xl p-7">
            <div className="text-white text-xl font-bold">{t}</div>
            <p className="mt-3 text-zinc-400 text-sm leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-12">
        <Link to="/quiz" data-testid="perm-cta" className="cl-btn-primary text-white rounded-full px-8 py-4 text-sm font-semibold tracking-wider uppercase">
          Build my perm routine →
        </Link>
      </div>
    </Section>
  );
}
