import React, { useEffect, useRef } from "react";

export default function AuraBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let tx = 0,
      ty = 0;
    let cx = 0,
      cy = 0;

    const onMove = (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty("--mx", `${cx * 120}px`);
      el.style.setProperty("--my", `${cy * 120}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
        background: "#020617",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          top: -250,
          left: -250,
          background:
            "radial-gradient(circle, rgba(34,197,94,0.95), rgba(34,197,94,0.0) 60%)",
          filter: "blur(90px)",
          mixBlendMode: "screen",
          transform: "translate(var(--mx), var(--my))",
          animation: "float1 18s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          bottom: -260,
          right: -260,
          background:
            "radial-gradient(circle, rgba(34,197,94,0.7), rgba(34,197,94,0.0) 60%)",
          filter: "blur(100px)",
          mixBlendMode: "screen",
          transform:
            "translate(calc(var(--mx) * -0.6), calc(var(--my) * -0.6))",
          animation: "float2 22s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          top: "45%",
          left: "55%",
          transform:
            "translate(-50%, -50%) translate(calc(var(--mx) * 0.35), calc(var(--my) * 0.35))",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.25), rgba(255,255,255,0.0) 65%)",
          filter: "blur(90px)",
          mixBlendMode: "screen",
          animation: "float3 16s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(2,6,23,0.0), rgba(2,6,23,0.55) 75%)",
        }}
      />

      <style>{`
        @keyframes float1 {
          0% { transform: translate(var(--mx), var(--my)) scale(1); }
          50% { transform: translate(calc(var(--mx) + 60px), calc(var(--my) - 40px)) scale(1.08); }
          100% { transform: translate(var(--mx), var(--my)) scale(1); }
        }
        @keyframes float2 {
          0% { transform: translate(calc(var(--mx) * -0.6), calc(var(--my) * -0.6)) scale(1); }
          50% { transform: translate(calc(var(--mx) * -0.6 - 70px), calc(var(--my) * -0.6 + 50px)) scale(1.07); }
          100% { transform: translate(calc(var(--mx) * -0.6), calc(var(--my) * -0.6)) scale(1); }
        }
        @keyframes float3 {
          0% { transform: translate(-50%, -50%) translate(calc(var(--mx) * 0.35), calc(var(--my) * 0.35)) scale(1); }
          50% { transform: translate(-50%, -50%) translate(calc(var(--mx) * 0.35 - 50px), calc(var(--my) * 0.35 + 40px)) scale(1.06); }
          100% { transform: translate(-50%, -50%) translate(calc(var(--mx) * 0.35), calc(var(--my) * 0.35)) scale(1); }
        }
      `}</style>
    </div>
  );
}
