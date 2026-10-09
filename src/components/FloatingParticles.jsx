import React from "react";

export default function FloatingParticles({ count = 10 }) {
  // Pre-generate deterministic particle positions/sizes
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 3 + (i % 4) * 2, // 3px to 9px
    left: `${(i * 97) % 90 + 5}%`,
    top: `${(i * 61) % 85 + 5}%`,
    opacity: 0.08 + (i % 3) * 0.05, // 0.08 to 0.18 opacity
    duration: 12 + (i % 5) * 4, // 12s to 28s
    delay: (i % 4) * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 hidden md:block">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#D4AF6A] blur-[1px] animate-ambient-particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: p.left,
            top: p.top,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
