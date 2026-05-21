export default function Bottle({ accent = "#8B5CF6", label = "CL", size = "md" }) {
  const sizes = {
    sm: { w: 90, h: 180, font: "text-[10px]", cap: 40 },
    md: { w: 140, h: 280, font: "text-xs", cap: 64 },
    lg: { w: 200, h: 380, font: "text-sm", cap: 88 },
  };
  const s = sizes[size] || sizes.md;
  return (
    <div className="relative inline-block" style={{ width: s.w, height: s.h + 30 }} aria-hidden="true">
      <div className="cl-orb" style={{ width: s.w * 1.6, height: s.h * 0.6, background: accent, opacity: 0.35, top: "20%", left: "-30%", zIndex: 0 }} />
      <div
        className="cl-bottle"
        style={{
          width: s.w, height: s.h,
          background: `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 50%), linear-gradient(180deg, #1a1a20, #0d0d12 60%, #050508)`,
        }}
      >
        <div className="cl-bottle-cap" style={{ width: s.cap, top: -24 }} />
        <div
          className="absolute inset-x-0 bottom-1/4 mx-auto flex flex-col items-center justify-center text-center px-3"
          style={{ color: accent }}
        >
          <div className={`${s.font} tracking-[0.3em] font-semibold uppercase opacity-80`}>CurlLoom</div>
          <div className="mt-2 h-px w-8 bg-white/20" />
          <div className={`${s.font} tracking-widest mt-2 text-white/90 uppercase`}>{label}</div>
        </div>
        <div
          className="absolute bottom-0 inset-x-0 h-1/3 opacity-60"
          style={{ background: `linear-gradient(180deg, transparent, ${accent}33)` }}
        />
      </div>
    </div>
  );
}
