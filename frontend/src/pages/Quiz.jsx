import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/lib/data";
import Section from "@/components/site/Section";
import { Link } from "react-router-dom";

const QUESTIONS = [
  { key: "hair_pattern", q: "What is your hair pattern?", opts: ["Straight", "Wavy", "Curly", "Coily", "Permed", "Unsure"] },
  { key: "porosity", q: "What is your hair porosity?", opts: ["Low", "Medium", "High", "Unsure"] },
  { key: "biggest_issue", q: "What is your biggest issue?", opts: ["Dryness", "Frizz", "Lack of hold", "Buildup", "Greasy feel", "Scalp discomfort", "Definition", "Flat roots / lack of volume"] },
  { key: "activity_level", q: "How active is your lifestyle?", opts: ["Low", "Moderate", "High", "Athlete / sports"] },
  { key: "product_feel", q: "What product feel do you prefer?", opts: ["Very lightweight", "Creamy but not heavy", "Strong hold", "Soft natural finish", "Wet look", "Volume"] },
  { key: "has_perm", q: "Do you have a perm?", opts: ["Yes", "No", "Considering one"] },
];

function decideRoutine(a) {
  if (a.has_perm === "Yes") return "Perm care routine";
  if (a.activity_level === "Athlete / sports" || a.activity_level === "High") return "Athlete routine";
  if (a.biggest_issue === "Buildup" || a.biggest_issue === "Greasy feel") return "Low-buildup routine";
  if (a.biggest_issue === "Lack of hold" || a.product_feel === "Strong hold") return "Hold-focused routine";
  return "Moisture-focused routine";
}

const ROUTINE_DETAILS = {
  "Moisture-focused routine": {
    blurb: "For curls that drink. Hydration-first stack designed to soften and define without weighing strands down.",
    products: ["Shampoo", "Conditioner", "Leave-In Conditioner", "Curl Cream"],
  },
  "Hold-focused routine": {
    blurb: "Definition that lasts. Built around a gel that breaks cleanly over a moisture base.",
    products: ["Shampoo", "Leave-In Conditioner", "Gel"],
  },
  "Athlete routine": {
    blurb: "Sweat. Helmet. Repeat. A lightweight cycle that survives a real day without buildup.",
    products: ["Shampoo", "Leave-In Conditioner", "Gel"],
  },
  "Perm care routine": {
    blurb: "Treats permed strands like the chemically-styled hair they are — moisture, slip, and soft definition.",
    products: ["Conditioner", "Leave-In Conditioner", "Curl Cream"],
  },
  "Low-buildup routine": {
    blurb: "Stripped down. Designed for hair that picks up residue easily — clean cleansing and light styling.",
    products: ["Shampoo", "Leave-In Conditioner", "Mousse"],
  },
};

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total = QUESTIONS.length;
  const isResult = step === total;

  const pick = (val) => {
    const q = QUESTIONS[step];
    setAnswers((a) => ({ ...a, [q.key]: val }));
    setTimeout(() => setStep(step + 1), 200);
  };

  const routine = decideRoutine(answers);

  const finish = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/quiz", { ...answers, email, routine_type: routine });
      setDone(true);
      toast.success("Results emailed. Welcome to CurlLoom.");
    } catch {
      toast.error("Couldn't save. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section eyebrow="Curl Quiz" title="Get Your Routine." lead="Six quick questions. We'll match you to a CurlLoom routine — even though products aren't launched yet, we'll prep your match.">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between text-xs text-zinc-500 mb-2">
            <span>Step {Math.min(step + 1, total)} of {total}</span>
            <span>{isResult ? "Complete" : `${Math.round((step / total) * 100)}%`}</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full bg-violet-500" initial={false} animate={{ width: `${Math.min(((step + (isResult ? 0 : 0)) / total) * 100 + (isResult ? 100 : 0), 100)}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isResult ? (
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{QUESTIONS[step].q}</h2>
              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                {QUESTIONS[step].opts.map((o) => (
                  <button key={o} data-testid={`quiz-opt-${o.toLowerCase().replace(/[^a-z0-9]/g, "-")}`} onClick={() => pick(o)}
                    className="text-left cl-glass hover:border-violet-500/40 rounded-2xl p-5 text-white transition group">
                    <span className="text-zinc-500 group-hover:text-violet-300 text-xs tracking-widest mr-3">→</span>
                    {o}
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button data-testid="quiz-back" onClick={() => setStep(step - 1)} className="mt-8 text-zinc-500 hover:text-white text-sm">← Back</button>
              )}
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="cl-glass-strong rounded-3xl p-10 relative overflow-hidden">
                <div className="cl-orb" style={{ width: 300, height: 300, background: "#8B5CF6", opacity: 0.3, top: -50, right: -50 }} />
                <div className="relative">
                  <div className="text-[11px] tracking-[0.3em] uppercase text-violet-300 mb-4">Your match</div>
                  <h2 data-testid="quiz-result-name" className="text-4xl sm:text-5xl font-bold text-white">{routine}</h2>
                  <p className="mt-5 text-zinc-400 leading-relaxed">{ROUTINE_DETAILS[routine].blurb}</p>

                  <div className="mt-8">
                    <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Your stack</div>
                    <div className="flex flex-wrap gap-2">
                      {ROUTINE_DETAILS[routine].products.map((pr) => (
                        <span key={pr} className="text-sm px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-100">{pr}</span>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-zinc-500">All products coming soon — early access first.</div>
                  </div>

                  {!done ? (
                    <form onSubmit={finish} className="mt-8" data-testid="quiz-email-form">
                      <div className="text-xs uppercase tracking-widest text-zinc-400 mb-3">Email to save your routine</div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input data-testid="quiz-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="flex-1 bg-white/[0.03] border border-white/10 rounded-full px-5 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none" />
                        <button type="submit" disabled={submitting} data-testid="quiz-submit" className="cl-btn-primary text-white rounded-full px-7 py-3 text-xs font-semibold tracking-wider uppercase disabled:opacity-50">
                          {submitting ? "Saving…" : "Join Early Access"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div data-testid="quiz-success" className="mt-8 p-5 rounded-2xl bg-violet-500/10 border border-violet-500/30">
                      <div className="text-white font-semibold">You're in.</div>
                      <div className="text-sm text-zinc-400 mt-1">Your routine match is on the way to your inbox.</div>
                    </div>
                  )}

                  <div className="mt-6">
                    <Link to="/shop" data-testid="quiz-explore" className="text-violet-300 hover:text-violet-200 text-sm">Explore all products →</Link>
                  </div>
                </div>
              </div>

              <button onClick={() => { setStep(0); setAnswers({}); setDone(false); setEmail(""); }}
                data-testid="quiz-restart"
                className="mt-6 text-zinc-500 hover:text-white text-sm">↺ Restart quiz</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}
