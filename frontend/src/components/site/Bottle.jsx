/**
 * Compact CSS-only bottle. Fully self-contained within its bounding box.
 * No external image, no mask-bleed.
 */
export default function Bottle({ accent = "#8B5CF6", label = "Leave-In", size = "md" }) {
  const sizes = {
    sm: { w: 130, h: 180, capW: 56, capH: 18, name: "text-[9px]", title: "text-[10px]" },
    md: { w: 170, h: 230, capW: 74, capH: 22, name: "text-[10px]", title: "text-xs" },
    lg: { w: 220, h: 300, capW: 96, capH: 28, name: "text-xs", title: "text-sm" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className="relative inline-flex items-end justify-center"
      style={{ width: s.w, height: s.h + s.capH + 16 }}
      aria-hidden="true"
    >
      {/* Soft halo glow behind */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: s.w * 1.7,
          height: s.h * 0.9,
          left: "50%",
          top: "20%",
          transform: "translateX(-50%)",
          background: `radial-gradient(ellipse at center, ${accent}66 0%, ${accent}22 35%, transparent 70%)`,
          filter: "blur(28px)",
          zIndex: 0,
        }}
      />

      {/* Cap */}
      <div
        className="absolute z-20"
        style={{
          width: s.capW,
          height: s.capH,
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "linear-gradient(180deg, #2a2a32 0%, #16161c 60%, #0a0a0e 100%)",
          borderRadius: "4px 4px 2px 2px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.5)",
        }}
      />

      {/* Bottle body */}
      <div
        className="relative z-10 flex flex-col items-center justify-end"
        style={{
          width: s.w,
          height: s.h,
          marginBottom: 0,
          background:
            "linear-gradient(180deg, #1c1c22 0%, #0e0e14 55%, #050508 100%)",
          borderRadius: "14px 14px 18px 18px",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: `
            inset 0 2px 4px rgba(255,255,255,0.06),
            inset 0 -30px 60px ${accent}1a,
            0 28px 50px -16px rgba(0,0,0,0.75)
          `,
          overflow: "hidden",
        }}
      >
        {/* Specular highlight stripe */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "8%",
            left: "12%",
            width: "8%",
            height: "55%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 80%)",
            filter: "blur(2px)",
            borderRadius: "8px",
          }}
        />

        {/* Subtle bottom violet wash */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "35%",
            background: `linear-gradient(180deg, transparent, ${accent}26)`,
          }}
        />

        {/* Label area — centered within the bottle, never bleeds out */}
        <div
          className="relative flex flex-col items-center justify-center text-center w-full px-3"
          style={{ paddingBottom: "22%" }}
        >
          <div
            className={`${s.name} tracking-[0.4em] font-semibold uppercase`}
            style={{ color: accent }}
          >
            CurlLoom
          </div>
          <div
            className="my-2 h-px"
            style={{ width: 24, background: "rgba(255,255,255,0.25)" }}
          />
          <div
            className={`${s.title} tracking-[0.25em] font-medium uppercase text-white/90 leading-tight`}
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
