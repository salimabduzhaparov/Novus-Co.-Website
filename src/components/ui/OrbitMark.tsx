export function OrbitMark({ size = 48 }: { size?: number }) {
  const core = size * 0.42;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full border animate-[orbit-spin_40s_linear_infinite]"
        style={{ borderColor: "rgba(127,168,255,0.28)" }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: Math.max(4, size * 0.09),
            height: Math.max(4, size * 0.09),
            top: -Math.max(2, size * 0.045),
            left: "50%",
            marginLeft: -Math.max(2, size * 0.045),
            background: "#ffffff",
            boxShadow: "0 0 10px 3px rgba(159,196,255,0.85)",
          }}
        />
      </div>
      <div
        className="absolute rounded-full border"
        style={{
          inset: size * 0.16,
          borderColor: "rgba(159,196,255,0.55)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "50%",
          width: core,
          height: core,
          marginLeft: -core / 2,
          marginTop: -core / 2,
          background:
            "radial-gradient(circle at 35% 30%, #1a2c56, #0a1226)",
          boxShadow: "0 0 18px rgba(47,109,246,0.45)",
        }}
      />
    </div>
  );
}
