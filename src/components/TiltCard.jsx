import React, { useState, useRef, useEffect } from "react";

export default function TiltCard({ children, className = "", disabled = false, maxTilt = 2 }) {
  const [style, setStyle] = useState({});
  const cardRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: none) or (pointer: coarse) or (prefers-reduced-motion: reduce)");
    if (media.matches) {
      setIsMobile(true);
    }
  }, []);

  const handleMouseMove = (e) => {
    if (disabled || isMobile || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`,
      transition: "transform 100ms cubic-bezier(0.03, 0.98, 0.52, 0.99)",
    });
  };

  const handleMouseLeave = () => {
    if (disabled || isMobile) return;
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 300ms ease-out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}
