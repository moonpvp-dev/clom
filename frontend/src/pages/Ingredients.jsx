import Section from "@/components/site/Section";

const SECTIONS = [
  { n: "01", t: "Purpose over hype", d: "We don't pad labels with trendy plants. Every ingredient earns its place — hydration, slip, structure, preservation, stability, or performance." },
  { n: "02", t: "Lightweight moisture system", d: "Pair humectants with low-weight emollients. The goal: softness and slip without a heavy film." },
  { n: "03", t: "Low-buildup approach", d: "Polymers and conditioners are selected to perform and rinse out, not to layer up on every wash day." },
  { n: "04", t: "Why preservation matters", d: "Any product with water needs preservation. Microbial safety is non-negotiable for something on your scalp." },
  { n: "05", t: "Why pH matters", d: "Hair and scalp prefer mildly acidic conditions. We test and target the right range for each formula." },
  { n: "06", t: "Why testing matters", d: "Stability, batch consistency, and patch-test guidance protect the people who use what we make." },
];

const AVOID = [
  "Excessive heavy butters",
  "Unnecessary oils",
  "Unsupported miracle claims",
  "Overloaded formulas with no purpose",
];

export default function Ingredients() {
  return (
    <>
      <Section eyebrow="Formula philosophy" title="Ingredient purpose over ingredient hype." lead="An honest look at how we think about what goes into a CurlLoom formula. Educational. Cosmetic in scope. Final formulas may change as development continues.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SECTIONS.map((s) => (
            <div key={s.n} className="cl-glass rounded-3xl p-7">
              <div className="text-violet-300 text-xs tracking-[0.3em] font-mono">{s.n}</div>
              <div className="mt-3 text-xl font-bold text-white">{s.t}</div>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="What we avoid overusing">
        <div className="grid sm:grid-cols-2 gap-4">
          {AVOID.map((a) => (
            <div key={a} className="cl-glass rounded-2xl p-5 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-300">×</div>
              <span className="text-white">{a}</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-zinc-500 max-w-2xl">
          Ingredient information is educational and cosmetic in nature. Final formulas may change as development continues.
        </p>
      </Section>
    </>
  );
}
