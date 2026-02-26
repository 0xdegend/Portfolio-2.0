"use client";
/**
 * AsciiPortrait
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders an image as a typographic halftone (ASCII / text mosaic) on a
 * <canvas>. Dark pixels → dense characters, light pixels → sparse/empty.
 *
 * FIX: The original used `useCallback` for the render loop and called
 * `requestAnimationFrame(render)` inside itself. This is a circular reference
 * — `render` tries to close over its own value before it's assigned, which
 * React's eslint rules flag as "accessed before declared".
 *
 * Solution: store the loop body in `renderRef` (a plain ref). The RAF callback
 * always calls `renderRef.current(now)`, which is always the latest version.
 * A `useEffect` writes the latest loop body into `renderRef` whenever `cellSize`
 * changes. This completely avoids the circular dependency.
 */

import { useRef, useEffect, useCallback } from "react";

// ─── Character ramp: lightest → densest ──────────────────────────────────────
const RAMP = " `·.,:;~=+ilI1tfjrxnuvczXYUJCLQ0OZmwqpdbkh#MW&8%B@$";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Ripple {
  x: number;
  y: number;
  born: number; // performance.now()
  amplitude: number; // peak displacement px
  speed: number; // wavefront expansion px/s
  wavelength: number; // ring spacing px
  maxR: number; // die radius
}

interface Props {
  src: string;
  active?: boolean; // drives opacity fade
  cellSize?: number; // px per cell (default 8)
  className?: string;
}

// ─── Luminance → warm gold color ─────────────────────────────────────────────
// Pre-bucketed for perf — ~8 fillStyle changes per frame instead of N*M.
function lumToColor(lum: number): string | null {
  if (lum > 0.88) return null; // background — skip
  if (lum > 0.72) return "rgb(173, 77, 55)";
  if (lum > 0.58) return "rgb(173, 77, 55)";
  if (lum > 0.44) return "rgb(173, 77, 55)";
  if (lum > 0.32) return "rgb(173, 77, 55)";
  if (lum > 0.2) return "rgb(173, 77, 55)";
  if (lum > 0.1) return "rgba(210,175,115,0.96)";
  return "rgba(220,185,120,1.00)";
}

export default function AsciiPortrait({
  src,
  active = false,
  cellSize = 8,
  className = "",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef<Float32Array | null>(null);
  const colsRef = useRef(0);
  const rowsRef = useRef(0);
  const opacityRef = useRef(active ? 1 : 0);
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const lastMouseRef = useRef({ x: -999, y: -999 });
  const renderRef = useRef<(now: number) => void>(() => {});

  // ── Build luminance buffer ─────────────────────────────────────────────────
  const buildBuffer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);
    if (cols < 1 || rows < 1) return;

    colsRef.current = cols;
    rowsRef.current = rows;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!mountedRef.current) return;
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const ctx = off.getContext("2d", { willReadFrequently: true })!;
      ctx.filter = "contrast(1.15) brightness(0.95)";
      ctx.drawImage(img, 0, 0, cols, rows);
      const { data } = ctx.getImageData(0, 0, cols, rows);
      const buf = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        const r = data[i * 4],
          g = data[i * 4 + 1],
          b = data[i * 4 + 2];
        buf[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      }
      bufferRef.current = buf;
    };
    img.src = src;
  }, [src, cellSize]);

  useEffect(() => {
    renderRef.current = (now: number) => {
      const canvas = canvasRef.current;
      const buf = bufferRef.current;
      if (!canvas || !buf) return;

      const ctx = canvas.getContext("2d")!;
      const cols = colsRef.current;
      const rows = rowsRef.current;
      const op = opacityRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (op < 0.005) return;

      // Advance ripples — drop dead ones
      ripplesRef.current = ripplesRef.current.filter((rip) => {
        const age = (now - rip.born) / 1000;
        return age * rip.speed < rip.maxR;
      });
      const alive = ripplesRef.current;

      // Batch cells by color to minimise ctx.fillStyle changes per frame
      const buckets = new Map<
        string,
        Array<{ ch: string; cx: number; cy: number }>
      >();

      ctx.font = `${Math.max(cellSize - 1, 5)}px "DM Mono","Courier New",monospace`;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Base cell center in canvas space
          let sx = col * cellSize + cellSize * 0.5;
          let sy = row * cellSize + cellSize * 0.5;

          // Apply ripple displacement to sampling position
          for (const rip of alive) {
            const age = (now - rip.born) / 1000;
            const R = age * rip.speed;
            const dx = sx - rip.x;
            const dy = sy - rip.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
            const diff = dist - R;
            if (Math.abs(diff) < rip.wavelength * 2) {
              const phase = (diff / rip.wavelength) * Math.PI;
              const falloff = Math.max(0, 1 - R / rip.maxR);
              const mag = Math.sin(phase) * rip.amplitude * falloff;
              sx += (dx / dist) * mag;
              sy += (dy / dist) * mag;
            }
          }

          // Sample buffer at (possibly displaced) position
          const sc = Math.max(0, Math.min(cols - 1, Math.round(sx / cellSize)));
          const sr = Math.max(0, Math.min(rows - 1, Math.round(sy / cellSize)));
          const lum = buf[sr * cols + sc];

          const color = lumToColor(lum);
          if (!color) continue;

          const charIdx = Math.floor((1 - lum) * (RAMP.length - 1));
          const ch = RAMP[charIdx];
          if (ch === " ") continue;

          if (!buckets.has(color)) buckets.set(color, []);
          buckets
            .get(color)!
            .push({ ch, cx: col * cellSize, cy: row * cellSize });
        }
      }

      // Draw all buckets
      ctx.globalAlpha = op;
      ctx.textBaseline = "top";
      for (const [color, cells] of buckets) {
        ctx.fillStyle = color;
        for (const { ch, cx, cy } of cells) {
          ctx.fillText(ch, cx, cy);
        }
      }
      ctx.globalAlpha = 1;
    };
  }, [cellSize]);

  // ── RAF trampoline — never references itself, always delegates to renderRef ─
  useEffect(() => {
    mountedRef.current = true;

    const loop = (now: number) => {
      if (!mountedRef.current) return;
      renderRef.current(now);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // runs once — no deps needed because loop → renderRef.current is indirect

  // ── Opacity transitions ────────────────────────────────────────────────────
  const fadeTo = useCallback((target: number, duration = 700) => {
    const start = performance.now();
    const from = opacityRef.current;
    const tick = (now: number) => {
      if (!mountedRef.current) return;
      const t = Math.min((now - start) / duration, 1);
      opacityRef.current = from + (target - from) * (1 - Math.pow(1 - t, 3));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    fadeTo(active ? 1 : 0);
  }, [active, fadeTo]);

  // ── Resize observer ────────────────────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      buildBuffer();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [buildBuffer]);

  // ── Mouse — spawn ripples ──────────────────────────────────────────────────
  const spawnRipple = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, amplitude: number, speed: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      ripplesRef.current.push({
        x,
        y,
        born: performance.now(),
        amplitude,
        speed,
        wavelength: cellSize * 3.5,
        maxR: Math.hypot(canvas.width, canvas.height),
      });
      if (ripplesRef.current.length > 10) ripplesRef.current.shift();
    },
    [cellSize],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      const { x: lx, y: ly } = lastMouseRef.current;
      if (Math.hypot(x - lx, y - ly) < 20) return; // throttle to every ~20px
      lastMouseRef.current = { x, y };
      spawnRipple(e, 5 + Math.random() * 3, 220 + Math.random() * 60);
    },
    [spawnRipple],
  );

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      spawnRipple(e, 18, 300);
    },
    [spawnRipple],
  );

  return (
    <div
      ref={wrapRef}
      className={`relative w-full h-full cursor-crosshair ${className}`}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
