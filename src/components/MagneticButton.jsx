import React, { useState, useRef, useEffect } from "react";

export default function MagneticButton({
  children,
  onClick,
  className = "",
  disabled = false,
  maxOffset = 5,
  title,
  type = "button",
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(hover: none) or (pointer: coarse) or (prefers-reduced-motion: reduce)");
    if (media.matches) {
      setIsMobile(true);
    }
  }, []);

  const handleMouseMove = (e) => {
    if (disabled || isMobile || !btnRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    const moveX = (distanceX / (rect.width / 2)) * maxOffset;
    const moveY = (distanceY / (rect.height / 2)) * maxOffset;

    setOffset({
      x: Math.max(-maxOffset, Math.min(maxOffset, moveX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, moveY)),
    });
  };

  const handleMouseLeave = () => {
    if (disabled || isMobile) return;
    setOffset({ x: 0, y: 0 });
  };

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      title={title}
      disabled={disabled}
      style={{
        transform: `translate3d(${offset.x.toFixed(2)}px, ${offset.y.toFixed(2)}px, 0)`,
        transition: offset.x === 0 && offset.y === 0 ? "transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1)" : "transform 100ms ease-out",
      }}
      className={className}
    >
      {children}
    </button>
  );
}
