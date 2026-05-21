import Section from "@/components/site/Section";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  ["What is CurlLoom?", "CurlLoom is an early-stage hair-care brand developing lightweight, low-buildup curl products for waves, curls, coils, perms, and active routines."],
  ["Are products available yet?", "Not yet. CurlLoom is in development and testing. Join early access to be among the first."],
  ["What hair types is CurlLoom for?", "Wavy, curly, coily, permed, and textured hair. Straight hair benefits from some products too — but the line is designed with texture in mind."],
  ["Is CurlLoom only for curly hair?", "No. It's a curl-aware brand. Wavy, coily, and permed routines are core to the lineup."],
  ["Is CurlLoom good for perms?", "Yes — perm care is a focus. Permed hair needs moisture and lightweight definition; that's what we're designing for."],
  ["Is CurlLoom good for athletes?", "Yes. We're designing with sweat, helmets, wind, and refresh routines in mind. No sweat-proof claims unless proven."],
  ["Are products tested?", "Internally: pH, stability, and batch records. External cosmetic chemist and dermatologist-informed review planned before wider distribution."],
  ["Are these medical products?", "No. CurlLoom products are cosmetic and not intended to diagnose, treat, cure, or prevent any disease."],
  ["What does low buildup mean?", "Our formulas are designed to perform on wash day, then rinse out — not layer up over a week of styling."],
  ["When will products launch?", "We'll announce timelines once formulas pass internal milestones. Early access will hear first."],
  ["How can I become a tester?", "Join early access and check 'Interested in testing' — we'll reach out as testing windows open."],
  ["How do I contact CurlLoom?", "Email help@curlloom.co or use the Contact form."],
];

export default function FAQ() {
  return (
    <Section eyebrow="Questions" title="Frequently asked.">
      <Accordion type="single" collapsible className="max-w-3xl">
        {FAQS.map(([q, a], i) => (
          <AccordionItem key={q} value={`item-${i}`} className="border-b border-white/5">
            <AccordionTrigger data-testid={`faq-q-${i}`} className="text-left text-white hover:no-underline py-5">
              {q}
            </AccordionTrigger>
            <AccordionContent className="text-zinc-400 leading-relaxed pb-5">
              {a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
