import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/data";
import Section from "@/components/site/Section";

const REASONS = ["General Question", "Tester Program", "Order Question", "Partnership", "Press", "Other"];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", reason: "General Question", message: "" });
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      setDone(true);
      toast.success("Message sent. We'll be in touch.");
    } catch {
      toast.error("Couldn't send. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section eyebrow="Contact" title="Get in touch." lead="Questions, partnerships, press, tester programs — write to us at help@curlloom.co or use the form.">
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          {done ? (
            <div data-testid="contact-success" className="cl-glass-strong rounded-3xl p-12 text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300 text-2xl">✓</div>
              <h3 className="text-2xl font-bold text-white">Thanks for reaching out.</h3>
              <p className="mt-3 text-zinc-400">A confirmation just hit your inbox. We'll follow up soon.</p>
            </div>
          ) : (
            <form onSubmit={submit} data-testid="contact-form" className="cl-glass-strong rounded-3xl p-8 sm:p-10 space-y-5">
              <Field label="Name">
                <input data-testid="contact-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none"
                  placeholder="Your name" />
              </Field>
              <Field label="Email">
                <input data-testid="contact-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none"
                  placeholder="you@email.com" />
              </Field>
              <Field label="Reason">
                <select data-testid="contact-reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none">
                  {REASONS.map((r) => <option key={r} className="bg-[#121217]">{r}</option>)}
                </select>
              </Field>
              <Field label="Message">
                <textarea data-testid="contact-message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none resize-none"
                  placeholder="Tell us a bit about what you're reaching out for…" />
              </Field>
              <button type="submit" disabled={submitting} data-testid="contact-submit"
                className="cl-btn-primary text-white rounded-full px-7 py-4 text-sm font-semibold tracking-wider uppercase disabled:opacity-50">
                {submitting ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
        <div className="lg:col-span-5 space-y-5">
          <div className="cl-glass rounded-3xl p-7">
            <div className="text-[11px] tracking-[0.3em] uppercase text-violet-300 mb-3">Email</div>
            <a href="mailto:help@curlloom.co" className="text-white text-lg hover:text-violet-300">help@curlloom.co</a>
          </div>
          <div className="cl-glass rounded-3xl p-7">
            <div className="text-[11px] tracking-[0.3em] uppercase text-violet-300 mb-3">Web</div>
            <div className="text-white text-lg">curlloom.co</div>
          </div>
          <div className="cl-glass rounded-3xl p-7">
            <div className="text-[11px] tracking-[0.3em] uppercase text-violet-300 mb-3">Response time</div>
            <p className="text-zinc-400 text-sm leading-relaxed">We aim to reply within 2 business days. Press and partnership inquiries may take a bit longer.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-widest text-zinc-400 mb-2">{label}</div>
      {children}
    </label>
  );
}
