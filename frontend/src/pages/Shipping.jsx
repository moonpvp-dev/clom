import Section from "@/components/site/Section";

export default function Shipping() {
  return (
    <Section eyebrow="Shipping & Returns" title="Policies will apply once orders open.">
      <div className="max-w-3xl space-y-8 text-zinc-300 leading-relaxed">
        <p className="text-zinc-400">CurlLoom is not yet selling products. The policies below outline our intended approach once orders open.</p>

        {[
          ["Processing time", "Orders are expected to process within 1–3 business days, excluding weekends and holidays."],
          ["Shipping rates", "Rates will be calculated at checkout based on destination and weight. Free-shipping thresholds may apply."],
          ["Damaged packages", "If your order arrives damaged, contact help@curlloom.co within 7 days with photos so we can replace it."],
          ["Incorrect items", "Received the wrong product? Reach out within 14 days and we'll make it right."],
          ["Returns", "Unopened products may be eligible for return within 30 days of delivery. Opened cosmetic items are generally non-returnable for hygiene reasons."],
          ["Refunds", "Approved refunds are issued to the original payment method within 5–10 business days."],
        ].map(([t, d]) => (
          <div key={t}>
            <h3 className="text-white text-xl font-bold">{t}</h3>
            <p className="mt-2 text-zinc-400">{d}</p>
          </div>
        ))}

        <div className="pt-6 border-t border-white/5">
          <p>Questions? <a href="mailto:help@curlloom.co" className="text-violet-300 hover:text-violet-200">help@curlloom.co</a></p>
        </div>
      </div>
    </Section>
  );
}
