export default function Section({ children, className = "", id, eyebrow, title, lead, align = "left" }) {
  return (
    <section id={id} className={`relative py-20 lg:py-28 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {(eyebrow || title || lead) && (
          <div className={`max-w-3xl mb-14 ${align === "center" ? "mx-auto text-center" : ""}`}>
            {eyebrow && (
              <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-violet-300 mb-5">
                <span className="w-6 h-px bg-violet-400/60" />
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05]">{title}</h2>
            )}
            {lead && (
              <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed">{lead}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
