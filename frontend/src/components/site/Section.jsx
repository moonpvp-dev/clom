export default function Section({ children, className = "", id, eyebrow, title, lead, align = "left" }) {
  return (
    <section id={id} className={`relative py-32 lg:py-44 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {(eyebrow || title || lead) && (
          <div className={`max-w-3xl mb-20 lg:mb-24 ${align === "center" ? "mx-auto text-center" : ""}`}>
            {eyebrow && (
              <div className="inline-flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase text-violet-300 mb-8">
                <span className="w-8 h-px bg-violet-400/60" />
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05]">{title}</h2>
            )}
            {lead && (
              <p className="mt-8 text-base sm:text-lg text-zinc-400 leading-[1.75]">{lead}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
