export default function Bottle({ accent = "#8B5CF6", label = "Leave-In", size = "md" }) {
  const sizes = {
    sm: { box: 180, name: "text-[10px]", divider: 28 },
    md: { box: 260, name: "text-[11px]", divider: 36 },
    lg: { box: 360, name: "text-sm", divider: 48 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className="relative inline-block"
      style={{ width: s.box, height: s.box }}
      aria-hidden="true"
    >
      {/* Glow behind */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accent}55, transparent 65%)`,
          filter: "blur(30px)",
          transform: "scale(0.9)",
          zIndex: 0,
        }}
      />

      {/* Bottle image */}
      <img
        src="/brand/bottle.png"
        alt=""
        className="relative w-full h-full object-cover rounded-3xl select-none"
        draggable={false}
        style={{
          filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.6))",
          zIndex: 1,
        }}
      />

      {/* Solid mask covering the entire text band on the original image */}
      <div
        className="absolute flex flex-col items-center justify-center text-center pointer-events-none"
        style={{
          left: "15%",
          right: "15%",
          top: "55%",
          bottom: "8%",
          background: "#070709",
          borderRadius: "10px",
          boxShadow: "0 0 60px 12px #070709",
          zIndex: 2,
        }}
      >
        <div
          className={`${s.name} tracking-[0.35em] font-semibold uppercase`}
          style={{ color: accent }}
        >
          CurlLoom
        </div>
        <div
          className="my-2 h-px bg-white/25"
          style={{ width: s.divider }}
        />
        <div
          className={`${s.name} tracking-[0.25em] font-medium uppercase text-white/95 leading-tight px-2`}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
