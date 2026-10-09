import React, { useEffect, useState } from "react";

export default function MouseGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check touch capabilities or reduced motion
    const touchQuery = window.matchMedia("(hover: none) or (pointer: coarse)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (touchQuery.matches || motionQuery.matches) {
      setIsTouch(true);
      return;
    }

    let reqId;
    let targetX = -500;
    let targetY = -500;
    let currentX = -500;
    let currentY = -500;
    let cursorX = -500;
    let cursorY = -500;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      // Check if mouse is over an interactive element
      const target = e.target;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA" ||
          target.closest("button") ||
          target.closest("a") ||
          target.closest(".card-luxury") ||
          target.closest(".cursor-interactive"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const updatePosition = () => {
      // Smooth lerp for background radial glow (slow interpolation)
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      // Faster lerp for cursor ring
      cursorX += (targetX - cursorX) * 0.25;
      cursorY += (targetY - cursorY) * 0.25;

      setPos({ x: currentX, y: currentY });
      setCursorPos({ x: cursorX, y: cursorY });

      reqId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove);
    reqId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(reqId);
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      {/* Subtle Radial Mouse-Follow Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-10 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, rgba(212,175,106,0.09), transparent 70%)`,
        }}
      />

      {/* Subtle Secondary Custom Cursor Ring (desktop only, keeping native pointer visible!) */}
      <div
        className={`fixed top-0 left-0 pointer-events-none z-50 rounded-full border border-[#D4AF6A]/40 transition-transform duration-200 ease-out hidden md:block ${
          isHovered
            ? "w-8 h-8 -ml-4 -mt-4 bg-[#D4AF6A]/10 border-[#D4AF6A]/70 scale-110 shadow-[0_0_12px_rgba(212,175,106,0.3)]"
            : "w-4 h-4 -ml-2 -mt-2 bg-[#D4AF6A]/0 scale-100"
        }`}
        style={{
          transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
        }}
      />
    </>
  );
}
