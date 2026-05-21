import Section from "@/components/site/Section";

export default function Privacy() {
  return (
    <Section eyebrow="Privacy" title="Privacy policy.">
      <div className="max-w-3xl space-y-8 text-zinc-300 leading-relaxed">
        <p className="text-zinc-400 text-sm">Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>

        {[
          ["Information we collect", "We collect information you provide directly — your name, email, hair-care preferences, and any messages you send us via forms on this site."],
          ["Email signups & forms", "When you join early access, complete the curl quiz, or contact us, your submission is stored so we can follow up and improve our products."],
          ["Cookies & analytics", "We may use basic cookies and analytics to understand how the site is used. You can disable cookies in your browser at any time."],
          ["How we use information", "To respond to inquiries, send updates you've opted into, improve product development, and notify you when CurlLoom products are available."],
          ["Data sharing", "We do not sell your personal information. We may share data with service providers (email delivery, analytics) under contractual confidentiality."],
          ["Data retention & rights", "You can request access, correction, or deletion of your information by emailing help@curlloom.co."],
          ["Updates", "We may update this policy as CurlLoom evolves. Material changes will be reflected on this page."],
          ["Contact", "Questions about privacy? Email help@curlloom.co."],
        ].map(([t, d]) => (
          <div key={t}>
            <h3 className="text-white text-xl font-bold">{t}</h3>
            <p className="mt-2 text-zinc-400">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
