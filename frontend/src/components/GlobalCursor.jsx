import React, { useEffect, useRef } from "react";

const colors = ["#0d9488", "#5eead4", "#ccfbf1"];

class Particle {
  constructor(x, y, ctx) {
    this.x = x + (Math.random() * 6 - 3); // Added a tiny horizontal spread for density
    this.y = y + (Math.random() * 6 - 3); 
    this.ctx = ctx;
    this.size = Math.random() * 2 + 1; 
    this.speedY = -0.3; // Even slower drift for a "thicker" feel
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.opacity = 0.9; 
  }
  
  update() {
    this.y += this.speedY;
    // Fast decay (0.035) to keep the high volume of particles from cluttering
    this.opacity -= 0.035; 
  }
  
  draw() {
    this.ctx.globalAlpha = this.opacity;
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

export default function GlobalCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    const handleMove = (e) => {
      /* BUMPED TO 12 PARTICLES:
         This creates a very rich, shimmering trail.
      */
      for (let i = 0; i < 12; i++) {
        particles.push(new Particle(e.clientX, e.clientY, ctx));
      }
    };

    window.addEventListener("mousemove", handleMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].opacity <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        display: "block"
      }}
    />
  );
}

