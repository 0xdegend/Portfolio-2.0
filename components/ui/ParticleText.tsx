"use client";
import {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useSyncExternalStore,
  type FC,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "@react-three/drei";

export interface ParticleTextProps {
  text?: string;
  particleCount?: number;
  color?: string;
  accentColor?: string;
  className?: string;
}

const SCENE_W = 10;
const SCENE_H = 2.8;
const HALF_W = SCENE_W / 2;
const HALF_H = SCENE_H / 2;
const CAM_Z = 5;
const CAM_FOV = (2 * Math.atan(HALF_H / CAM_Z) * 180) / Math.PI;

const CIRCLE_SEGS = 32;
const PARTICLE_R = 0.0088;
const T_GATHER = 3.0;
const T_RETURN = 2.6;
const T_HOVER = 1.2;
const T_RIPPLE_OUT = 0.5;
const T_RIPPLE_RET = 2.0;
const NUDGE_R = 0.9;
const NUDGE_FORCE = 0.18;
const NUDGE_SPRING = 0.12;

function sampleGlyphPositions(
  text: string,
  count: number,
): { tx: Float32Array; ty: Float32Array } {
  const FONT_PX = 200;
  const PAD = FONT_PX * 0.45;
  const cvs = document.createElement("canvas");
  cvs.width = Math.ceil(FONT_PX * text.length * 0.66 + PAD * 2);
  cvs.height = Math.ceil(FONT_PX + PAD * 2);

  const ctx = cvs.getContext("2d")!;
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  ctx.fillStyle = "#fff";
  ctx.font = `700 ${FONT_PX}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cvs.width / 2, cvs.height / 2);

  const { data } = ctx.getImageData(0, 0, cvs.width, cvs.height);
  const candidates: [number, number][] = [];
  for (let y = 0; y < cvs.height; y += 3)
    for (let x = 0; x < cvs.width; x += 3)
      if (data[(y * cvs.width + x) * 4 + 3] > 128)
        candidates.push([
          (x - cvs.width / 2) / cvs.width,
          (y - cvs.height / 2) / cvs.height,
        ]);

  if (!candidates.length)
    return { tx: new Float32Array(count), ty: new Float32Array(count) };

  const stride = Math.max(1, Math.floor(candidates.length / count));
  const tx = new Float32Array(count);
  const ty = new Float32Array(count);
  let out = 0;
  for (let i = 0; i < candidates.length && out < count; i += stride, out++) {
    tx[out] = candidates[i][0] * SCENE_W * 0.86;
    ty[out] = -candidates[i][1] * SCENE_H * 1.05;
  }
  while (out < count) {
    const src = candidates[Math.floor(Math.random() * candidates.length)];
    tx[out] = src[0] * SCENE_W * 0.86;
    ty[out] = -src[1] * SCENE_H * 1.05;
    out++;
  }
  return { tx, ty };
}

function buildEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const faceColors: number[][] = [
    [0.82, 0.7, 0.42],
    [0.1, 0.1, 0.18],
    [0.95, 0.88, 0.72],
    [0.06, 0.05, 0.08],
    [0.55, 0.45, 0.25],
    [0.14, 0.18, 0.35],
  ];

  const SIZE = 64;
  const images: THREE.DataTexture[] = faceColors.map(([r, g, b]) => {
    const buf = new Uint8Array(SIZE * SIZE * 4);
    for (let i = 0; i < SIZE * SIZE; i++) {
      const px = (i % SIZE) / SIZE - 0.5;
      const py = Math.floor(i / SIZE) / SIZE - 0.5;
      const m = Math.max(0.35, 1 - Math.hypot(px, py) * 1.1);
      buf[i * 4 + 0] = Math.min(255, r * m * 255);
      buf[i * 4 + 1] = Math.min(255, g * m * 255);
      buf[i * 4 + 2] = Math.min(255, b * m * 255);
      buf[i * 4 + 3] = 255;
    }
    const t = new THREE.DataTexture(buf, SIZE, SIZE, THREE.RGBAFormat);
    t.needsUpdate = true;
    return t;
  });

  const cubeTexture = new THREE.CubeTexture(
    images.map((t) => {
      const cvs = document.createElement("canvas");
      cvs.width = SIZE;
      cvs.height = SIZE;
      const ctx2 = cvs.getContext("2d")!;
      const id = ctx2.createImageData(SIZE, SIZE);
      //@ts-expect-error Typescript
      id.data.set(t.image.data);
      ctx2.putImageData(id, 0, 0);
      return cvs;
    }),
  );
  cubeTexture.needsUpdate = true;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const result = pmrem.fromCubemap(cubeTexture).texture;
  pmrem.dispose();
  cubeTexture.dispose();
  return result;
}

interface SceneProps extends Required<Omit<ParticleTextProps, "className">> {
  hoverRef: { current: boolean };
  clickRef: { current: number };
  ndcRef: { current: { x: number; y: number } };
}

const ParticleScene: FC<SceneProps> = ({
  text,
  particleCount,
  color,
  accentColor,
  hoverRef,
  clickRef,
  ndcRef,
}) => {
  const { camera, gl } = useThree();

  const envMap = useMemo(() => buildEnvMap(gl), [gl]);
  const geometry = useMemo(
    () => new THREE.CircleGeometry(PARTICLE_R, CIRCLE_SEGS),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.9,
        roughness: 0.25,
        envMap,
        envMapIntensity: 2.4,
        transparent: false,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    [color, envMap],
  );

  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geometry, material, particleCount);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < particleCount; i++) {
      dummy.position.set(0, 0, -100);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    return m;
  }, [geometry, material, particleCount]);

  const { tx: restX, ty: restY } = useMemo(
    () => sampleGlyphPositions(text, particleCount),
    [text, particleCount],
  );

  const scatterX = useMemo(() => {
    const a = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++)
      a[i] = (Math.random() - 0.5) * (SCENE_W - 0.5);
    return a;
  }, [particleCount]);

  const scatterY = useMemo(() => {
    const a = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++)
      a[i] = (Math.random() - 0.5) * (SCENE_H - 0.3);
    return a;
  }, [particleCount]);

  const baseX = useRef(new Float32Array(particleCount));
  const baseY = useRef(new Float32Array(particleCount));
  const nudgeX = useRef(new Float32Array(particleCount));
  const nudgeY = useRef(new Float32Array(particleCount));
  const offZ = useRef(new Float32Array(particleCount));
  const scaleV = useRef(new Float32Array(particleCount).fill(1));
  const _mtx = useRef(new THREE.Matrix4());
  const _pos = useRef(new THREE.Vector3());
  const _quat = useRef(new THREE.Quaternion());
  const _scl = useRef(new THREE.Vector3(1, 1, 1));
  const _col = useRef(new THREE.Color());
  const _acc = useRef(new THREE.Color(accentColor));

  const gsapCtx = useRef<gsap.Context | null>(null);
  const animating = useRef(true);
  const prevHover = useRef(false);
  const prevClick = useRef(0);

  useEffect(() => {
    animating.current = true;
    gsapCtx.current?.kill();

    for (let i = 0; i < particleCount; i++) {
      baseX.current[i] = scatterX[i];
      baseY.current[i] = scatterY[i];
      nudgeX.current[i] = 0;
      nudgeY.current[i] = 0;
      offZ.current[i] = 0;
      scaleV.current[i] = 1;
    }

    for (let i = 0; i < particleCount; i++) {
      const delay = Math.random() * 1.4;
      const obj = { x: baseX.current[i], y: baseY.current[i] };
      gsap.to(obj, {
        x: restX[i],
        y: restY[i],
        duration: T_GATHER,
        delay,
        ease: "expo.out",
        onUpdate() {
          baseX.current[i] = obj.x;
          baseY.current[i] = obj.y;
        },
      });
    }

    const id = setTimeout(
      () => {
        animating.current = false;
      },
      (T_GATHER + 1.6) * 1000,
    );
    return () => clearTimeout(id);
  }, [text, particleCount]);

  const doScatter = useCallback(() => {
    animating.current = true;
    gsapCtx.current?.kill();
    gsapCtx.current = gsap.context(() => {});

    for (let i = 0; i < particleCount; i++) {
      const delay = Math.random() * 0.3;
      const obj = { x: baseX.current[i], y: baseY.current[i] };
      gsap.to(obj, {
        x: scatterX[i],
        y: scatterY[i],
        duration: T_HOVER,
        delay,
        ease: "power2.inOut",
        onUpdate() {
          baseX.current[i] = obj.x;
          baseY.current[i] = obj.y;
        },
      });
    }
    setTimeout(
      () => {
        animating.current = false;
      },
      (T_HOVER + 0.4) * 1000,
    );
  }, [particleCount, scatterX, scatterY]);

  const doReturn = useCallback(() => {
    animating.current = true;
    gsapCtx.current?.kill();
    gsapCtx.current = gsap.context(() => {});

    for (let i = 0; i < particleCount; i++) {
      const dist = Math.hypot(
        baseX.current[i] - restX[i],
        baseY.current[i] - restY[i],
      );
      const delay = (dist / SCENE_W) * 0.5 + Math.random() * 0.15;
      const obj = { x: baseX.current[i], y: baseY.current[i] };
      gsap.to(obj, {
        x: restX[i],
        y: restY[i],
        duration: T_RETURN,
        delay,
        ease: "expo.out",
        onUpdate() {
          baseX.current[i] = obj.x;
          baseY.current[i] = obj.y;
        },
      });
    }
    setTimeout(
      () => {
        animating.current = false;
      },
      (T_RETURN + 0.6) * 1000,
    );
  }, [particleCount, restX, restY]);

  const doRipple = useCallback(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const wPos = new THREE.Vector3(
      ndcRef.current.x,
      ndcRef.current.y,
      0,
    ).unproject(cam);
    const maxDist = Math.hypot(SCENE_W, SCENE_H);

    for (let i = 0; i < particleCount; i++) {
      const dist = Math.hypot(
        baseX.current[i] - wPos.x,
        baseY.current[i] - wPos.y,
      );
      const delay = (dist / maxDist) * 0.45;
      const str = Math.max(0, 1 - dist / (maxDist * 0.65));
      const obj = { z: offZ.current[i], s: scaleV.current[i] };

      gsap.to(obj, {
        z: str * 0.5,
        s: 1 + str * 0.4,
        duration: T_RIPPLE_OUT,
        delay,
        ease: "power3.out",
        onUpdate() {
          offZ.current[i] = obj.z;
          scaleV.current[i] = obj.s;
        },
        onComplete() {
          gsap.to(obj, {
            z: 0,
            s: 1,
            duration: T_RIPPLE_RET,
            ease: "elastic.out(1, 0.4)",
            onUpdate() {
              offZ.current[i] = obj.z;
              scaleV.current[i] = obj.s;
            },
          });
        },
      });
    }
  }, [camera, ndcRef, particleCount]);

  useFrame(() => {
    const hovering = hoverRef.current;
    if (hovering !== prevHover.current) {
      prevHover.current = hovering;
      hovering ? doScatter() : doReturn();
    }
    const click = clickRef.current;
    if (click !== prevClick.current) {
      prevClick.current = click;
      doRipple();
    }
    const cam = camera as THREE.PerspectiveCamera;
    const mouseActive = ndcRef.current.x > -900;
    const curW = mouseActive
      ? new THREE.Vector3(ndcRef.current.x, ndcRef.current.y, 0).unproject(cam)
      : new THREE.Vector3(-9999, -9999, 0);

    _acc.current.set(accentColor);

    for (let i = 0; i < particleCount; i++) {
      if (mouseActive && !animating.current) {
        const dx = baseX.current[i] + nudgeX.current[i] - curW.x;
        const dy = baseY.current[i] + nudgeY.current[i] - curW.y;
        const dist = Math.hypot(dx, dy) + 0.001;
        if (dist < NUDGE_R) {
          const push = (1 - dist / NUDGE_R) * NUDGE_FORCE;
          const targetNx = (dx / dist) * push;
          const targetNy = (dy / dist) * push;
          nudgeX.current[i] += (targetNx - nudgeX.current[i]) * 0.18;
          nudgeY.current[i] += (targetNy - nudgeY.current[i]) * 0.18;
        } else {
          nudgeX.current[i] *= 1 - NUDGE_SPRING;
          nudgeY.current[i] *= 1 - NUDGE_SPRING;
        }
      } else {
        nudgeX.current[i] *= 1 - NUDGE_SPRING;
        nudgeY.current[i] *= 1 - NUDGE_SPRING;
      }

      const fx = Math.max(
        -HALF_W + 0.1,
        Math.min(HALF_W - 0.1, baseX.current[i] + nudgeX.current[i]),
      );
      const fy = Math.max(
        -HALF_H + 0.05,
        Math.min(HALF_H - 0.05, baseY.current[i] + nudgeY.current[i]),
      );
      const fz = offZ.current[i];
      const s = scaleV.current[i];

      _pos.current.set(fx, fy, fz);
      _scl.current.set(s, s, s);
      _mtx.current.compose(_pos.current, _quat.current, _scl.current);
      mesh.setMatrixAt(i, _mtx.current);

      const cdist = Math.hypot(curW.x - fx, curW.y - fy);
      const ct = Math.max(0, 1 - cdist / (SCENE_W * 0.3));
      _col.current.set(color);
      if (ct > 0.01) _col.current.lerp(_acc.current, ct * 0.8);
      _col.current.multiplyScalar(1 + fz * 1.8);
      mesh.setColorAt(i, _col.current);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <ambientLight color="#c8a86a" intensity={30} />
      <directionalLight color="#ffd580" intensity={15} position={[4, 6, 4]} />
      <directionalLight
        color="#4466bb"
        intensity={15}
        position={[-5, -3, -2]}
      />
      <directionalLight
        color="#ff6820"
        intensity={15}
        position={[0.5, -5, -5]}
      />
      <pointLight
        color="#ffe8c0"
        intensity={15}
        distance={12}
        decay={2}
        position={[0, 3, 3]}
      />
      <primitive object={mesh} scale={1.8} />
    </>
  );
};

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

const Fallback: FC<{ text: string; color: string }> = ({ text, color }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 800 120"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label={text}
  >
    <text
      x="50%"
      y="55%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontFamily="monospace"
      fontWeight="700"
      fontSize="90"
      fill={color}
      opacity="0.85"
    >
      {text}
    </text>
  </svg>
);

const ParticleTextScene: FC<ParticleTextProps> = ({
  text = "0xdegend",
  particleCount = 900,
  color = "#C9A87C",
  accentColor = "#FFE8B0",
  className,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);

  // ── Hydration-safe client detection via useSyncExternalStore ─────────────
  // Third arg (() => false) = server snapshot → renders null on SSR.
  // Second arg (() => true) = client snapshot → renders content after hydration.
  // No useState, no useEffect, no setState warning, no hydration mismatch.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const hoverRef = useRef(false);
  const clickRef = useRef(0);
  const ndcRef = useRef({ x: -999, y: -999 });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    ndcRef.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndcRef.current.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }, []);

  const onMouseEnter = useCallback(() => {
    hoverRef.current = true;
  }, []);
  const onMouseLeave = useCallback(() => {
    hoverRef.current = false;
    ndcRef.current = { x: -999, y: -999 };
  }, []);
  const onClick = useCallback(() => {
    clickRef.current += 1;
  }, []);

  // Server and initial client render both return null — no mismatch
  if (!mounted) return null;

  // Safe to call here: only ever reaches this point on the client
  const webgl = hasWebGL();

  if (!webgl) {
    return (
      <div
        className={className}
        style={{ width: "100%", height: "100%" }}
        aria-label={text}
      >
        <Fallback text={text} color={color} />
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ width: "100%", height: "100%", cursor: "crosshair" }}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, -1, CAM_Z], fov: CAM_FOV, near: 0.1, far: 50 }}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        dpr={[1, 2]}
      >
        <ParticleScene
          text={text}
          particleCount={particleCount}
          color={color}
          accentColor={accentColor}
          hoverRef={hoverRef}
          clickRef={clickRef}
          ndcRef={ndcRef}
        />
      </Canvas>
    </div>
  );
};

export default ParticleTextScene;
