'use client';

/**
 * Gwiazdka ASCII w hero (Three.js + AsciiEffect). Port zatwierdzonego prototypu (wersja 7).
 *
 * Sterowanie: Hero woła `render(t)` w trakcie animacji startowej (t = czas osi 0..INTRO_DURATION),
 * a po jej zakończeniu `startLoop(t)` uruchamia własną pętlę obrotu. Pętla rysuje tylko wtedy,
 * gdy hero jest widoczne i karta jest na pierwszym planie; po powrocie liczy czas dalej od miejsca
 * pauzy (bez skoku). Zasady wydajności: .agent/04_3d_animation_logic.md.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js';
import { INTRO_DURATION, type StarHandle } from './heroIntroConfig';
import styles from './HeroStar.module.css';

interface HeroStarProps {
  /** Wołane po zbudowaniu sceny (uchwyt) lub z null, gdy WebGL jest niedostępny / przy sprzątaniu. */
  onReady: (handle: StarHandle | null) => void;
}

// ---- bryła „Moneta” ----
const R = 1;
const ARM_W = 0.47;
const DEPTH = R * 0.5;

function outline(len: number, w: number): Array<[number, number]> {
  const h = w / 2;
  const N = 5;
  const arms: Array<{ d: [number, number]; n: [number, number] }> = [];
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < N; i++) {
    const a = ((90 + 72 * i) * Math.PI) / 180;
    arms.push({ d: [Math.cos(a), Math.sin(a)], n: [-Math.sin(a), Math.cos(a)] });
  }
  for (let i = 0; i < N; i++) {
    const A = arms[i];
    const P = arms[(i + N - 1) % N];
    const a1 = [-h * A.n[0], -h * A.n[1]];
    const a2 = [h * P.n[0], h * P.n[1]];
    const bx = a2[0] - a1[0];
    const by = a2[1] - a1[1];
    const det = A.d[0] * -P.d[1] - -P.d[0] * A.d[1];
    const s = (bx * -P.d[1] - -P.d[0] * by) / det;
    pts.push([a1[0] + s * A.d[0], a1[1] + s * A.d[1]]);
    pts.push([len * A.d[0] - h * A.n[0], len * A.d[1] - h * A.n[1]]);
    pts.push([len * A.d[0] + h * A.n[0], len * A.d[1] + h * A.n[1]]);
  }
  return pts;
}

// obrys: środek 0,0265 nad początkiem układu
const BB_W = 2.048;
const BB_CY = 0.0265;

interface Frame {
  cx: number;
  cy: number;
  /** px na jednostkę modelu */
  p: number;
}
interface Layout {
  start: Frame;
  end: Frame;
  /** „szerokość sceny” do doboru gęstości znaków (jak sceneW w prototypie) */
  sceneW: number;
}

const START_P = (0.8 * 147) / BB_W;
const U_MAX = 1.8;

/** Pozycje startowa i końcowa gwiazdki w pikselach hero. Na desktopie kadr 800x600 wyśrodkowany w hero. */
function getLayout(W: number, H: number): Layout {
  if (W >= 768) {
    const u = Math.min(W / 800, H / 600, U_MAX);
    const ox = (W - 800 * u) / 2;
    const oy = (H - 600 * u) / 2;
    return {
      start: { cx: ox + 400.5 * u, cy: oy + 300 * u, p: START_P * u },
      end: { cx: ox + 255.5 * u, cy: oy + 271 * u, p: 280 * u },
      sceneW: 800 * u,
    };
  }
  // telefon: kadr z szerokości ekranu, gwiazdka większa względem kadru (żeby była czytelna)
  const u = W / 800;
  return {
    start: { cx: W / 2, cy: H / 2, p: START_P * u * 1.7 },
    end: { cx: W * 0.47, cy: H * 0.34, p: 280 * u * 1.3 },
    sceneW: W,
  };
}

const CAM_Z = 4.8;
const FOV0 = 30;
const VIS0 = 2 * CAM_Z * Math.tan(((FOV0 / 2) * Math.PI) / 180);
const PAD = 1.25;
const BASE_PERIOD = 25.5;
const TILT_DUR = 2.4;
/** faza startowa obrotu (stopnie): gwiazdka jest bliska zwróconej na wprost w t = 1..6 s */
const PHASE_DEG = 0;
/** pętla bezczynna rysuje co ~33 ms (30 kl/s) — obrót trwa 25 s, więcej nie ma sensu */
const LOOP_FRAME_MS = 33;
/** do tego czasu (s) intro gwiazdka stoi w miejscu i nie obraca się */
const INTRO_STATIC_END = 1.0;
/** od tego czasu (s) ruch (pozycja/skala) jest skończony; zostaje wolny obrót */
const INTRO_MOTION_END = 3.4;
/** krok rozmiaru siatki znaków (parzysty), żeby nie przebudowywać tabeli przy każdej zmianie skali */
const N_STEP = 16;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const powInOut = (p: number, n: number) =>
  p < 0.5 ? 0.5 * Math.pow(2 * p, n) : 1 - 0.5 * Math.pow(2 * (1 - p), n);
const prog = (t: number, start: number, dur: number) => clamp01((t - start) / dur);

function wantedRes(sceneW: number) {
  // 0,20 od szerokości sceny 800 px w górę; na wąskich scenach gęściej, żeby gwiazdka nie rozpadła się na kilka znaków
  return sceneW >= 800 ? 0.2 : Math.min(0.32, 0.2 * Math.sqrt(800 / sceneW));
}

export function HeroStar({ onReady }: HeroStarProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // ---- renderer i scena ----
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      onReady(null); // brak WebGL: napisy działają bez gwiazdki
      return;
    }
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 1);
    // Prototyp (three r128) liczył światło bez zarządzania kolorem i z mnożnikiem π — odtwarzamy ten wygląd.
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    const LIGHT_K = Math.PI;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV0, 1, 0.1, 50);
    camera.position.set(0, 0, CAM_Z);
    const c = 0.85;
    const amb = new THREE.AmbientLight(0xffffff, (0.42 - 0.34 * c) * LIGHT_K);
    const key = new THREE.DirectionalLight(0xffffff, (0.8 + 0.6 * c) * LIGHT_K);
    key.position.set(3, 4, 3.5);
    const fill = new THREE.DirectionalLight(0xffffff, (0.32 - 0.14 * c) * LIGHT_K);
    fill.position.set(-4, 0.5, 2.5);
    const back = new THREE.DirectionalLight(0xffffff, (0.55 - 0.15 * c) * LIGHT_K);
    back.position.set(-2, 1, -4);
    scene.add(amb, key, fill, back);

    const shape = new THREE.Shape();
    outline(R, ARM_W).forEach((pt, i) => {
      if (i === 0) shape.moveTo(pt[0], pt[1]);
      else shape.lineTo(pt[0], pt[1]);
    });
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false });
    geo.translate(0, 0, -DEPTH / 2);
    const mat = new THREE.MeshLambertMaterial();
    mat.color.setRGB(0xc0 / 255, 0xc0 / 255, 0xc0 / 255, THREE.LinearSRGBColorSpace);
    const mesh = new THREE.Mesh(geo, mat);
    const pivot = new THREE.Group();
    pivot.add(mesh);
    scene.add(pivot);
    const axisVec = new THREE.Vector3(Math.sin((-45 * Math.PI) / 180), Math.cos((-45 * Math.PI) / 180), 0);

    // ---- efekt ASCII ----
    let effect: AsciiEffect | null = null;
    let asciiDiv: HTMLDivElement | null = null;
    let res = 0;
    let curN = 0;
    let W = host.clientWidth || 800;
    let H = host.clientHeight || 600;
    let layout = getLayout(W, H);
    let lastT = 0;

    // Renderer pod efekt rysuje w 2x rozdzielczości siatki znaków (uśrednianie przy zmniejszaniu).
    function buildEffect() {
      const proxy = {
        domElement: renderer.domElement,
        render: (s: THREE.Object3D, cam: THREE.Camera) => renderer.render(s as THREE.Scene, cam),
        setSize: (w: number, h: number) => {
          renderer.setSize(Math.max(2, Math.round(w * res * 2)), Math.max(2, Math.round(h * res * 2)), false);
        },
      };
      effect = new AsciiEffect(proxy as unknown as THREE.WebGLRenderer, ' .:-=+*#%@', {
        invert: true,
        resolution: res,
      });
      if (process.env.NODE_ENV !== 'production') {
        const w = window as unknown as { __heroBuilds?: number };
        w.__heroBuilds = (w.__heroBuilds ?? 0) + 1;
      }
      host!.replaceChildren();
      asciiDiv = effect.domElement as HTMLDivElement;
      host!.appendChild(asciiDiv);
      curN = 0;
    }

    // Intro: dla t <= 1 s (gwiazdka stoi, nic się nie zmienia) rysujemy raz; po t > 3,4 s
    // (koniec ruchu, zostaje tylko wolny obrót) nie częściej niż krok pętli bezczynnej.
    let drewStatic = false;
    let lastIntroDraw = 0;
    function renderStar(t: number, throttle = false) {
      if (throttle) {
        if (t <= INTRO_STATIC_END) {
          if (drewStatic) return;
        } else if (t > INTRO_MOTION_END) {
          const now = performance.now();
          if (now - lastIntroDraw < LOOP_FRAME_MS - 2) return;
          lastIntroDraw = now;
        }
      }
      drewStatic = t <= INTRO_STATIC_END;
      lastT = t;
      const e = powInOut(prog(t, 1.0, 2.4), 4); // power3.inOut
      const { start, end, sceneW } = layout;
      const p = lerp(start.p, end.p, e);
      const cx = lerp(start.cx, end.cx, e);
      const cy = lerp(start.cy, end.cy, e);
      const oy = cy + BB_CY * p; // początek układu leży poniżej środka obrysu
      // mała gwiazdka dostaje drobniejszą siatkę znaków (x2 na starcie), do bazowej dochodzi razem ze skalą
      // (kwantyzacja co 0,04: ~5 przebudów efektu zamiast ~10)
      const wantRes = Math.min(0.6, Math.round(wantedRes(sceneW) * (1 + (1 - e)) * 25) / 25);
      if (wantRes !== res || !effect) {
        res = wantRes;
        buildEffect();
      }
      if (!effect || !asciiDiv) return;
      // Rozmiar siatki rośnie skokowo (krok N_STEP, w górę), a skala modelu i tak jest dopasowana
      // dokładnie przez FOV kamery poniżej — zamiast zmiany co 2 znaki (~60 razy w trakcie zoomu).
      const n = Math.max(N_STEP, N_STEP * Math.ceil((p * VIS0 * PAD * res) / N_STEP));
      const E = n / res;
      if (n !== curN) {
        curN = n;
        if (process.env.NODE_ENV !== 'production') {
          const w = window as unknown as { __heroResizes?: number };
          w.__heroResizes = (w.__heroResizes ?? 0) + 1;
        }
        effect.setSize(E, E);
        const tb = asciiDiv.querySelector('table');
        asciiDiv.style.width = E + 'px';
        asciiDiv.style.height = E + 'px';
        if (tb) {
          tb.style.fontFamily = 'var(--font-ibm-plex-mono), "IBM Plex Mono", "Courier New", monospace';
          tb.style.letterSpacing = -0.2 / res + 'px';
        }
      }
      const vis = E / p; // widoczna wysokość modelu przy z=0 -> dokładne dopasowanie skali
      camera.fov = ((2 * Math.atan(vis / (2 * CAM_Z))) * 180) / Math.PI;
      camera.updateProjectionMatrix();
      asciiDiv.style.transform = `translate(${(cx - E / 2).toFixed(2)}px,${(oy - E / 2).toFixed(2)}px)`;
      // Obrót bazowy rusza razem z ruchem (t=1), więc po obrocie 360° gwiazdka nie staje, tylko zwalnia do tempa pętli.
      const omega = (2 * Math.PI) / BASE_PERIOD;
      const k = powInOut(prog(t, 1.0, TILT_DUR), 4);
      const ang =
        (PHASE_DEG * Math.PI) / 180 +
        omega * Math.max(0, t - 1.0) -
        omega * TILT_DUR * k +
        2 * Math.PI * k;
      mesh.quaternion.setFromAxisAngle(axisVec, ang);
      // na starcie gwiazdka stoi na wprost (płasko, jak 2D); przechył 20° narasta w czasie ruchu
      pivot.rotation.x = ((20 * Math.PI) / 180) * k;
      effect.render(scene, camera);
      if (process.env.NODE_ENV !== 'production') {
        const w = window as unknown as { __heroFrames?: number };
        w.__heroFrames = (w.__heroFrames ?? 0) + 1;
      }
    }

    // ---- pętla obrotu po zakończeniu animacji startowej ----
    let wantLoop = false;
    let inView = true;
    let raf = 0;
    let loopT = INTRO_DURATION;
    let lastNow = 0;
    let lastDraw = 0;

    const canRun = () => wantLoop && inView && document.visibilityState === 'visible';
    function tick(now: number) {
      raf = 0;
      if (!canRun()) return;
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;
      loopT += dt;
      if (now - lastDraw >= LOOP_FRAME_MS - 2) {
        lastDraw = now;
        renderStar(loopT);
      }
      raf = requestAnimationFrame(tick);
    }
    function kick() {
      if (raf || !canRun()) return;
      lastNow = performance.now();
      raf = requestAnimationFrame(tick);
    }
    function halt() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    const handle: StarHandle = {
      render: (t, throttle) => {
        renderStar(t, throttle);
      },
      startLoop: (t) => {
        loopT = t;
        wantLoop = true;
        kick();
      },
      stopLoop: () => {
        wantLoop = false;
        halt();
      },
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[entries.length - 1].isIntersecting;
        if (inView) kick();
        else halt();
      },
      { threshold: 0 },
    );
    io.observe(host);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') kick();
      else halt();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const ro = new ResizeObserver(() => {
      const nw = host.clientWidth;
      const nh = host.clientHeight;
      if (!nw || !nh || (nw === W && nh === H)) return;
      W = nw;
      H = nh;
      layout = getLayout(W, H);
      if (effect) renderStar(lastT);
    });
    ro.observe(host);

    onReady(handle);

    return () => {
      onReady(null);
      halt();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      host.replaceChildren();
      effect = null;
      asciiDiv = null;
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [onReady]);

  return <div ref={hostRef} className={styles.host} aria-hidden="true" />;
}
