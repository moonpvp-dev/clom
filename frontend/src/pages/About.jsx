import Section from "@/components/site/Section";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      <Section eyebrow="About CurlLoom" title="Founded on a frustration." lead="CurlLoom was created to build better curl care for people who felt current products were either too heavy, too greasy, too weak, or not designed for real daily routines.">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6 text-zinc-300 leading-relaxed">
            <p>The shelves are full of curl products. Most of them ask you to pick a trade-off — softness or hold, definition or movement, performance or feel. None of those compromises hold up on day two, after a workout, or under a helmet.</p>
            <p>So we started CurlLoom to design a routine that works for real life. Lightweight enough to wear daily. Defined enough to look intentional. Clean enough that the gym, the wind, and the week don't unravel it.</p>
            <p>CurlLoom is founder-led and in early development. We're a small team doing the unglamorous work — formulation iterations, stability checks, batch records, pH testing — before we ever ask you to put something on your hair.</p>
          </div>
          <div className="lg:col-span-5">
            <div className="cl-glass-strong rounded-3xl p-8">
              <div className="text-[11px] tracking-[0.3em] uppercase text-violet-300 mb-4">Mission</div>
              <p className="text-white text-lg leading-relaxed font-medium">Make curl care that earns its place in your routine — without buildup, without compromise, without the heavy stuff.</p>
            </div>
            <div className="mt-5 cl-glass rounded-3xl p-8">
              <div className="text-[11px] tracking-[0.3em] uppercase text-violet-300 mb-4">Who CurlLoom is for</div>
              <ul className="space-y-2 text-zinc-300 text-sm">
                <li>• Wavy, curly, coily textures</li>
                <li>• Permed and chemically-styled hair</li>
                <li>• Athletes and active routines</li>
                <li>• Anyone tired of greasy buildup</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Future vision" title="Beyond launch.">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { t: "Listen", d: "Tester programs, founder office hours, real conversations about real hair." },
            { t: "Iterate", d: "Formulas improve. Versions ship. We're transparent about what changes." },
            { t: "Expand", d: "From a complete curl system, into routines for the whole household — slowly, deliberately." },
          ].map((x) => (
            <div key={x.t} className="cl-glass rounded-3xl p-7">
              <div className="text-white text-xl font-bold">{x.t}</div>
              <p className="mt-3 text-zinc-400 leading-relaxed text-sm">{x.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/#early-access" data-testid="about-cta" className="inline-block cl-btn-primary text-white rounded-full px-8 py-4 text-sm font-semibold tracking-wider uppercase">
            Join Early Access
          </Link>
        </div>
      </Section>
    </>
  );
}
