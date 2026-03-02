import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, invalidate } from "@react-three/fiber";
const ACCENT_HEX = 0xc9a87c;
const TEX_W = 1024;
const TEX_H = 512;
const FONT_SIZE = 13;
const LINE_H = FONT_SIZE + 5;
const PAD_X = 20;
const PAD_Y = 22;
const ACCENT = "#C9A87C";

export interface TerminalPlaneProps {
  position: [number, number, number];
  rotation: [number, number, number];
  codeText: string;
  startDelay: number;
  isActive: boolean;
}

interface Token {
  type: TokenType;
  text: string;
}

const KEYWORDS = new Set([
  "import",
  "export",
  "default",
  "from",
  "const",
  "let",
  "var",
  "function",
  "return",
  "async",
  "await",
  "if",
  "else",
  "for",
  "while",
  "new",
  "true",
  "false",
  "null",
  "undefined",
  "type",
  "interface",
  "class",
  "extends",
  "useEffect",
  "useRef",
  "useState",
  "set",
  "get",
  "echo",
  "pnpm",
  "docker",
  "aws",
]);

type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "operator"
  | "function"
  | "plain";

const TOKEN_COLOR: Record<TokenType, string> = {
  keyword: "#C792EA",
  string: "#C3E88D",
  comment: "#546E7A",
  number: "#F78C6C",
  operator: "#89DDFF",
  function: "#82AAFF",
  plain: "#CDD3DE",
};

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let rest = line;
  while (rest.length) {
    let m: RegExpMatchArray | null;

    if ((m = rest.match(/^(\/\/.*)/))) {
      tokens.push({ type: "comment", text: m[1] });
      break;
    }
    if ((m = rest.match(/^(#.*)/))) {
      tokens.push({ type: "comment", text: m[1] });
      break;
    }
    if ((m = rest.match(/^(`[^`]*`|'[^']*'|"[^"]*")/))) {
      tokens.push({ type: "string", text: m[1] });
      rest = rest.slice(m[1].length);
      continue;
    }
    if ((m = rest.match(/^(\b\d+\.?\d*\b)/))) {
      tokens.push({ type: "number", text: m[1] });
      rest = rest.slice(m[1].length);
      continue;
    }
    if ((m = rest.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/))) {
      const w = m[1];
      tokens.push({
        type: KEYWORDS.has(w)
          ? "keyword"
          : /^[A-Z]/.test(w)
            ? "function"
            : "plain",
        text: w,
      });
      rest = rest.slice(w.length);
      continue;
    }
    if ((m = rest.match(/^([^a-zA-Z0-9_$`'"#\/\s]+)/))) {
      tokens.push({ type: "operator", text: m[1] });
      rest = rest.slice(m[1].length);
      continue;
    }
    if ((m = rest.match(/^(\s+)/))) {
      tokens.push({ type: "plain", text: m[1] });
      rest = rest.slice(m[1].length);
      continue;
    }
    tokens.push({ type: "plain", text: rest[0] });
    rest = rest.slice(1);
  }
  return tokens;
}

function drawTerminal(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  cursor: boolean,
  active: boolean,
) {
  // Background
  ctx.fillStyle = active ? "#0E1116" : "#080B10";
  ctx.fillRect(0, 0, w, h);

  // Glow border
  ctx.strokeStyle = active ? `${ACCENT}55` : `${ACCENT}18`;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, w - 2, h - 2);

  // Title bar
  ctx.fillStyle = active ? "#1A1F2C" : "#0F1318";
  ctx.fillRect(0, 0, w, 30);

  // Traffic-light dots
  ["#FF5F57", "#FEBC2E", "#28C840"].forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(PAD_X + i * 18, 15, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });

  ctx.font = `${FONT_SIZE - 2}px monospace`;
  ctx.fillStyle = "#6A7A8A";
  ctx.textAlign = "left";
  ctx.fillText("◆  terminal.ts", PAD_X + 68, 20);

  // Code
  ctx.font = `${FONT_SIZE}px monospace`;
  const lines = text.split("\n");
  let y = 30 + PAD_Y;

  for (let li = 0; li < lines.length; li++) {
    if (y > h - 12) break;
    // Line number
    ctx.fillStyle = "#2E3748";
    ctx.fillText(String(li + 1).padStart(3, " "), PAD_X, y);

    const tokens = tokenizeLine(lines[li]);
    let x = PAD_X + 38;
    const isLast = li === lines.length - 1;

    for (const tok of tokens) {
      ctx.fillStyle = TOKEN_COLOR[tok.type];
      ctx.fillText(tok.text, x, y);
      x += ctx.measureText(tok.text).width;
    }

    if (isLast && cursor) {
      ctx.fillStyle = active ? ACCENT : "#5A6A7A";
      ctx.fillRect(x + 1, y - FONT_SIZE + 2, 2, FONT_SIZE + 1);
    }
    y += LINE_H;
  }

  // Scanlines
  ctx.fillStyle = "rgba(0,0,0,0.035)";
  for (let sy = 30; sy < h; sy += 3) ctx.fillRect(0, sy, w, 1);
}

class TypingEngine {
  private visibleLen = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private cursorTimer: ReturnType<typeof setInterval> | null = null;
  private cursorVisible = true;
  public done = false;

  constructor(
    private code: string,
    private onUpdate: () => void,
  ) {}

  start(delayMs = 0) {
    this.cursorTimer = setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      this.onUpdate();
    }, 500);
    this.timer = setTimeout(() => this.typeNext(), delayMs);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    if (this.cursorTimer) clearInterval(this.cursorTimer);
  }

  private typeNext() {
    if (this.visibleLen >= this.code.length) {
      this.done = true;
      this.onUpdate();
      return;
    }
    const ch = this.code[this.visibleLen];
    let d = 14 + Math.random() * 46;
    if (ch === "\n") d = 90 + Math.random() * 130;
    else if ("{}()[]".includes(ch)) d = 40 + Math.random() * 55;
    else if (";,".includes(ch)) d = 50 + Math.random() * 70;
    if (Math.random() < 0.018) d += 260 + Math.random() * 340;
    this.visibleLen++;
    this.onUpdate();
    this.timer = setTimeout(() => this.typeNext(), d);
  }

  getVisible() {
    return this.code.slice(0, this.visibleLen);
  }
  isCursorVisible() {
    return this.cursorVisible;
  }
}

export function TerminalPlane({
  position,
  rotation,
  codeText,
  startDelay,
  isActive,
}: TerminalPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const texRef = useRef<THREE.CanvasTexture | null>(null);
  const activeRef = useRef(isActive);
  const emRef = useRef(0.08);

  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = TEX_W;
    canvas.height = TEX_H;
    const ctx = canvas.getContext("2d")!;

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    texRef.current = tex;

    if (matRef.current) {
      matRef.current.map = tex;
      matRef.current.emissiveMap = tex;
      matRef.current.needsUpdate = true;
    }

    drawTerminal(ctx, TEX_W, TEX_H, "", true, false);
    tex.needsUpdate = true;

    const engine = new TypingEngine(codeText, () => {
      drawTerminal(
        ctx,
        TEX_W,
        TEX_H,
        engine.getVisible(),
        engine.isCursorVisible(),
        activeRef.current,
      );
      if (texRef.current) texRef.current.needsUpdate = true;
      invalidate();
    });
    engine.start(startDelay);

    return () => {
      engine.stop();
      tex.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redraw on active change
  useEffect(() => {
    const tex = texRef.current;
    if (!tex) return;
    // Trigger a cursor-cycle redraw on next engine tick (handled by engine's interval)
    invalidate();
  }, [isActive]);

  useFrame((_, delta) => {
    const target = isActive ? 0.38 : 0.07;
    emRef.current += (target - emRef.current) * Math.min(1, delta * 5);
    if (matRef.current) matRef.current.emissiveIntensity = emRef.current;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow>
      <planeGeometry args={[3.2, 2.0]} />
      <meshStandardMaterial
        ref={matRef}
        color="#080C12"
        emissive={new THREE.Color(ACCENT_HEX)}
        emissiveIntensity={0.07}
        roughness={0.1}
        metalness={0.05}
        toneMapped={false}
      />
    </mesh>
  );
}
