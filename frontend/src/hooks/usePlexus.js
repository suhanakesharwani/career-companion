import { useEffect } from "react";

export function usePlexusAnimation(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const rnd = (a, b) => a + (b - a) * Math.random();
    const NODE_COLORS  = ["#00d4ff", "#0066ff", "#3040ff", "#00aaff", "#60b8ff"];
    const PULSE_COLORS = ["#00ffff", "#00d4ff", "#ffffff", "#80eeff"];
    const FLARE_COLORS = ["rgba(0,200,255,", "rgba(100,160,255,", "rgba(180,220,255,"];
    const CONN_DIST = 170;
    const NUM_NODES = 65;

    const nodes = Array.from({ length: NUM_NODES }, () => {
      const depth = rnd(0.2, 1.0);
      return {
        x: rnd(0, canvas.width),
        y: rnd(0, canvas.height),
        z: depth,
        vx: rnd(-0.2, 0.2) * (1 - depth * 0.5),
        vy: rnd(-0.14, 0.14) * (1 - depth * 0.5),
        r: rnd(1.5, 4.5) * depth,
        col: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
        phase: rnd(0, Math.PI * 2),
        bokeh: depth < 0.4,
      };
    });

    function makePulse() {
      for (let tries = 0; tries < 40; tries++) {
        const a = Math.floor(Math.random() * nodes.length);
        const b = Math.floor(Math.random() * nodes.length);
        if (a === b) continue;
        const dx = nodes[b].x - nodes[a].x;
        const dy = nodes[b].y - nodes[a].y;
        if (Math.sqrt(dx * dx + dy * dy) < CONN_DIST) {
          return { a, b, p: Math.random(), speed: rnd(0.003, 0.009), col: PULSE_COLORS[Math.floor(Math.random() * PULSE_COLORS.length)], size: rnd(2, 5) };
        }
      }
      return { a: 0, b: 1, p: 0, speed: 0.005, col: "#00d4ff", size: 3 };
    }

    let pulses = Array.from({ length: 20 }, makePulse);
    let flares = [], edges = [], t = 0, frame = 0, raf;

    function buildEdges() {
      edges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONN_DIST) edges.push({ i, j, d });
        }
      }
    }

    function drawBg() {
      ctx.fillStyle = "#0A0A0F"; // MATCHED TO YOUR NEW THEME
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const g = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.4, 0, canvas.width * 0.5, canvas.height * 0.4, canvas.width * 0.65);
      g.addColorStop(0, "rgba(0,20,70,0.3)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function loop() {
      t++; frame++;
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = canvas.width + 20; if (n.x > canvas.width + 20) n.x = -20;
        if (n.y < -20) n.y = canvas.height + 20; if (n.y > canvas.height + 20) n.y = -20;
      }
      if (frame % 3 === 0) buildEdges();
      drawBg();
      // ... (Rest of drawing logic: drawEdges, drawNodes, drawPulses, drawFlares)
      // I've truncated for brevity, but you'll paste your existing drawing functions here.
      raf = requestAnimationFrame(loop);
    }

    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}