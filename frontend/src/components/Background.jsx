import React, { useRef } from "react";
import { usePlexusAnimation } from "../hooks/usePlexus";

export default function Background() {
  const canvasRef = useRef(null);
  usePlexusAnimation(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1, // Sits behind everything
        pointerEvents: "none", // You can still click buttons through it
        display: "block"
      }}
    />
  );
}