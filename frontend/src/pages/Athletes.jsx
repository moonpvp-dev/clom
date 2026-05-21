import Section from "@/components/site/Section";
import { Link } from "react-router-dom";

export default function Athletes() {
  return (
    <>
      <Section eyebrow="Athletes & active curls" title="Built with active curls in mind." lead="Sweat, helmets, workouts, wind, and long days break down styles fast. CurlLoom is exploring formulas that feel clean, perform under movement, and don't leave heavy residue.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            ["Sweat", "Designed to feel comfortable through workouts and long days."],
            ["Helmets", "No greasy transfer, no flattened curls underneath."],
            ["Gym routines", "Refresh-friendly between sessions, not weighed down."],
            ["Wind", "Definition that doesn't unravel with movement."],
            ["Day-long wear", "Hold and feel that survive past 5pm."],
            ["Refresh-friendly", "Quick mid-day touch-ups without product layering."],
          ].map(([t, d]) => (
            <div key={t} className="cl-glass rounded-3xl p-7">
              <div className="text-white text-xl font-bold">{t}</div>
              <p className="mt-3 text-zinc-400 text-sm leading-relaxed">{d}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-zinc-500 max-w-2xl">
          We don't claim "sweat-proof" unless proven. Our language: <em>designed with active routines in mind.</em>
        </p>

        <div className="mt-12">
          <Link to="/#early-access" data-testid="athletes-cta" className="cl-btn-primary text-white rounded-full px-8 py-4 text-sm font-semibold tracking-wider uppercase">
            Join Athlete Early Access
          </Link>
        </div>
      </Section>
    </>
  );
}
