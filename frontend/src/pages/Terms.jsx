import Section from "@/components/site/Section";

export default function Terms() {
  return (
    <Section eyebrow="Terms" title="Terms of service.">
      <div className="max-w-3xl space-y-8 text-zinc-300 leading-relaxed">
        <p className="text-zinc-400 text-sm">Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>

        {[
          ["Use of the website", "By using curlloom.co, you agree to these terms. If you do not agree, please do not use the site."],
          ["Product availability", "CurlLoom is in development. Product descriptions, statuses, and timelines may change. Information is provided as-is."],
          ["No medical advice", "Content on this site is for general information only and is not medical advice. Consult a qualified professional for medical or dermatological concerns."],
          ["Intellectual property", "All site content — brand name, logo, copy, and visuals — is owned by CurlLoom or its licensors. Don't reproduce without permission."],
          ["User submissions", "When you submit forms, you grant CurlLoom permission to use the information to respond to you, develop products, and improve our service."],
          ["Limitation of liability", "To the fullest extent permitted by law, CurlLoom is not liable for indirect or consequential damages arising from use of this site."],
          ["Governing law", "These terms are governed by the laws of the Commonwealth of Virginia."],
          ["Contact", "Questions about these terms? Email help@curlloom.co."],
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
