'use client';

// Faithful port of the React Bits "Lanyard" component (TS + CSS variant),
// https://reactbits.dev — kept as close to the original source as possible so
// it's a fair reference point next to our own build. Only adapted for
// Next.js: the .glb/.png assets are loaded from /public via URL strings
// instead of bundler imports, styling uses a CSS module instead of a global
// class, and the scene is gated behind an IntersectionObserver + Suspense
// boundary to match the other two variants on this page.
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, type ThreeElement, type ThreeEvent } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import { createLanyardStrapTexture } from './createLanyardStrapTexture';
import { createDuotoneImage } from './createDuotoneImage';
import styles from './LanyardReactBits.module.css';

const CARD_GLB_URL = '/lanyard/card.glb';
// Fixed badge colors — not theme CSS vars. The card is meant to look like a
// printed physical object, so its tone shouldn't invert when the site
// switches to dark mode the way `--color-text`/`--color-bg` do.
const CARD_SHADOW = '#1A1A1A';
const CARD_CREAM = '#F5F1E8';
const CARD_ACCENT = '#55AAAA';
// How far the card's visible top edge sits above its own RigidBody origin,
// in world units — derived from the card group's own transform
// (position=[0,-1.2,-0.05], scale=2.25) applied to the card mesh's local top
// Y (1.0229, measured from card.glb's POSITION accessor, same source as the
// CARD_MESH_* constants in the cardMap texture code below): -1.2 + 2.25 *
// 1.0229 ≈ 1.1015. Used by the optional drag ceiling (dragCeilingFraction)
// to convert "don't let the card's visible top cross this line" into a limit
// on the RigidBody origin's Y translation.
const CARD_VISUAL_TOP_OFFSET = 1.1015;
// Same derivation as CARD_VISUAL_TOP_OFFSET, for the card's other two edges
// (mesh X range ±0.3582, Y min 0.0229 — same card.glb POSITION accessor):
// bottom = -1.2 + 2.25 * 0.0229 ≈ -1.1485 (below the RigidBody origin);
// half-width = 2.25 * 0.3582 ≈ 0.8060 (no group X offset, so symmetric).
// Used to keep the card's actual visible edges — not just its origin point —
// away from the canvas frame's true edge on every side, not only the top.
const CARD_VISUAL_BOTTOM_OFFSET = -1.1485;
const CARD_VISUAL_HALF_WIDTH = 0.806;

// Angle (from horizontal) the rope chain is laid out along before gravity
// takes over on the first physics step. Stock react-bits lays it out flat
// (0°), which starts the card level with its anchor and already inside the
// frame — so on mount it pops into view half-visible and only then falls.
// Starting it up above the frame instead means the drop-in enters from
// off-screen, which is the whole point of this constant.
// The chain starts fully extended (the rope joints below are max-distance-1
// constraints, so each link sits exactly 1 unit further along this direction)
// and the card hangs 1.45 under the last link — the spherical joint's anchor
// offset — so the card's origin starts at world y = 4 + 3·sin(θ) − 1.45,
// where 4 is the <group> the whole assembly lives in.
// At 75° that lands at ≈5.45, putting the card's bottom edge
// (CARD_VISUAL_BOTTOM_OFFSET) at ≈4.30. With the camera at z=30 / fov 20°
// the frame's half-height is 30·tan(10°) ≈ 5.29, and PortfolioLanyard's
// HERO_CLIP hides the top 15% of it — everything above y ≈ 3.70 — so the card
// clears that line by ≈0.6 world units (~50px in Hero's box) and is fully
// hidden until it falls. Deliberately not 90°: straight up is an inverted
// pendulum, which can sit there balanced or topple to either side at random
// instead of swinging the same way every load.
const INTRO_ANGLE_DEG = 75;
const INTRO_STEP_X = Math.cos((INTRO_ANGLE_DEG * Math.PI) / 180);
const INTRO_STEP_Y = Math.sin((INTRO_ANGLE_DEG * Math.PI) / 180);
/** Nth rope link's starting position; n = 1..3 (the fixed anchor is n = 0). */
const introLink = (n: number): [number, number, number] => [
  INTRO_STEP_X * n,
  INTRO_STEP_Y * n,
  0,
];
const INTRO_CARD_POSITION: [number, number, number] = [
  INTRO_STEP_X * 3,
  INTRO_STEP_Y * 3 - 1.45,
  0,
];

extend({ MeshLineGeometry, MeshLineMaterial });

// Force an image upright for the portrait card slot. Phone photos often decode
// landscape on a <canvas> (the browser doesn't apply their EXIF orientation
// tag when drawing to canvas), which showed the photo lying on its side. If
// the decoded image is wider than tall, rotate it 90° clockwise into a
// portrait canvas so it always lands upright regardless of the file's EXIF.
function uprightForPortrait(img: HTMLImageElement): HTMLImageElement | HTMLCanvasElement {
  if (img.width <= img.height) return img;
  const c = document.createElement('canvas');
  c.width = img.height;
  c.height = img.width;
  const cx = c.getContext('2d');
  if (!cx) return img;
  cx.translate(c.width / 2, c.height / 2);
  cx.rotate(Math.PI / 2);
  cx.drawImage(img, -img.width / 2, -img.height / 2);
  return c;
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb). Each
// custom image is composited into its own half so the two faces render
// independently, aspect-preserving (no stretching).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
  className?: string;
  // Fraction of the frame height, measured from the top, that the card can't
  // be dragged above — meant to match a CSS crop (e.g. PortfolioLanyard's
  // HERO_CLIP) so dragging can never pull the card into a clipped, invisible
  // region. 0 = top of frame, 1 = bottom. Omit/null for no limit (playground).
  dragCeilingFraction?: number | null;
  // Locale for the card's own on-canvas prompt text (front face when no
  // frontImage is supplied). Defaults to 'pl'.
  lang?: 'pl' | 'en';
  // Fired on a plain tap/click (the same gesture that triggers the flip —
  // see the onPointerUp handler in Band below), in addition to the flip
  // itself. Lets a page-level orchestrator (PortfolioLanyard) hook into the
  // click without this component knowing anything about flights/scrolling.
  onFlipClick?: () => void;
}

function LanyardCanvas({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  dragCeilingFraction = null,
  lang = 'pl',
  onFlipClick,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = (): void => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Canvas
      camera={{ position, fov }}
      dpr={[1, isMobile ? 1.5 : 2]}
      gl={{ alpha: transparent }}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
    >
      <ambientLight intensity={Math.PI} />
      <Suspense fallback={null}>
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            dragCeilingFraction={dragCeilingFraction}
            lang={lang}
            onFlipClick={onFlipClick}
          />
        </Physics>
        <Environment blur={0.2}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Suspense>
    </Canvas>
  );
}

export default function Lanyard({ className, ...props }: LanyardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: '200px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={stageRef} className={className ? `${styles.stage} ${className}` : styles.stage}>
      {active && <LanyardCanvas {...props} />}
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
  dragCeilingFraction?: number | null;
  lang?: 'pl' | 'en';
  onFlipClick?: () => void;
}

type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3;
};

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  dragCeilingFraction = null,
  lang = 'pl',
  onFlipClick,
}: BandProps) {
  const band = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(
    null!
  );
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<LanyardRigidBody>(null!);
  const j2 = useRef<LanyardRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  // @react-three/rapier interpolates a RigidBody's *synced Object3D* every
  // render frame (see its internal `state.object.position.lerp(...)`), but
  // that interpolation never touches values read back via `body.translation()`
  // — those stay pinned to the raw, once-per-physics-step position. The card
  // mesh is a direct RigidBody child, so it gets the smooth interpolation for
  // free; the band was reading the rope joints' raw translations, which only
  // change at the physics step rate — visually choppier than the card even
  // though both are driven by the same simulation. An empty child <group> on
  // each rope segment inherits the same interpolated transform via ordinary
  // Three.js parenting, so reading its world position instead of the raw
  // translation gets the band the same free smoothing as the card.
  const fixedObj = useRef<THREE.Object3D>(null!);
  const j1Obj = useRef<THREE.Object3D>(null!);
  const j2Obj = useRef<THREE.Object3D>(null!);
  const j3Obj = useRef<THREE.Object3D>(null!);
  const currentPos = useMemo(() => new THREE.Vector3(), []);

  // Distinguish a tap/click from an actual drag by hold duration, not by how
  // far the card moved: the kinematic follow starts chasing the cursor the
  // instant you press, so even a millisecond of ordinary click jitter was
  // enough to blow past a movement threshold — every click was getting
  // misread as a drag. Instead, don't start the drag at all until the press
  // has been held past HOLD_TO_DRAG_MS; a release before that fires is
  // unambiguously a click, since drag mode was never entered.
  const HOLD_TO_DRAG_MS = 180;
  const dragTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDragOffset = useRef(new THREE.Vector3());

  // The card starts above the frame (see INTRO_ANGLE_DEG) so it drops into
  // view rather than popping in already half-visible — but the free-swing
  // ceiling in useFrame would snap it back down on the very first physics
  // step and undo exactly that. So the ceiling stays disarmed until the card
  // has fallen below it once under its own weight; from then on it behaves as
  // before, catching drag-release overshoot. One-way on purpose: re-disarming
  // it would let a hard throw escape off the top of the frame.
  const ceilingArmed = useRef(false);

  // Bistable "flip" mechanic. The card has two rest orientations: facing the
  // camera (front, Y-angle 0) and turned around (back, Y-angle π). A click
  // flips to the other face; `targetFaceAngle` is whichever one we're steering
  // toward right now. The useFrame controller below continuously pulls the
  // card's Y rotation to this target and *holds* it there — the key change
  // from stock react-bits, whose `ang.y - rot.y * 0.25` always snapped back to
  // front, so the card could never rest showing its back. Rotation is about Y
  // (the vertical axis) precisely because that's what actually turns a flat
  // card over to reveal the other side — an in-plane roll never would.
  // FLIP_IMPULSE gives the flip a snappy kick; FACE_HOLD_K is how firmly it's
  // pulled to and held on the chosen face.
  const targetFaceAngle = useRef(0);
  const FLIP_IMPULSE = 0.22;
  const FACE_HOLD_K = 0.16;

  useEffect(() => {
    return () => {
      if (dragTimer.current) clearTimeout(dragTimer.current);
    };
  }, []);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const getLerped = (body: LanyardRigidBody, obj: THREE.Object3D): THREE.Vector3 => {
    if (!body.lerped) {
      body.lerped = new THREE.Vector3();
      obj.getWorldPosition(body.lerped);
    }

    return body.lerped;
  };

  const { nodes, materials } = useGLTF(CARD_GLB_URL) as unknown as {
    nodes: { card: THREE.Mesh; clip: THREE.Mesh; clamp: THREE.Mesh };
    materials: { base: THREE.MeshStandardMaterial; metal: THREE.MeshStandardMaterial };
  };
  // useTexture must be called unconditionally; use a blank pixel when an image
  // isn't supplied for a given face, then skip compositing it below.
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);
  // Same unconditional-hook rule for the strap: load a blank pixel when no
  // custom lanyardImage is supplied, then fall back to our own procedural
  // strap print (see createLanyardStrapTexture) instead of the react-bits
  // demo's baked-in logo texture.
  const loadedLanyardTexture = useTexture(lanyardImage || BLANK_PIXEL);
  const ownLanyardTexture = useMemo(
    () => (lanyardImage ? null : createLanyardStrapTexture()),
    [lanyardImage]
  );
  const texture = ownLanyardTexture ?? loadedLanyardTexture;

  // Composite the front/back images into the card's texture atlas (front = left
  // half, back = right half). Each image is drawn aspect-preserving (no stretch).
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map as THREE.Texture;

    const baseImg = baseMap.image as HTMLImageElement;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    // Keep the original baked atlas for the card edges (its rounded silhouette
    // extends slightly past FRONT/BACK_UV_RECT). The two faces themselves are
    // always fully overpainted below — by a real image if one was supplied,
    // otherwise by our own placeholder — so the react-bits demo's own baked-in
    // logo/mockup never shows through either face.
    ctx.drawImage(baseImg, 0, 0, W, H);

    const NAME = 'Jakub Pełka';
    const ROLE = 'FULL-STACK DEVELOPER';
    const FRONT_PROMPT = lang === 'en'
      ? { title: 'CLICK ME', sub: '[ flip card ]' }
      : { title: 'KLIKNIJ MNIE', sub: '[ obróć kartę ]' };

    // The card.glb "card" mesh's true bounds, measured directly from its
    // POSITION accessor: width 0.7164, height 1.0000 (mesh units), rounded
    // corners of radius 0.0386 (found by tracing where the flat edges end
    // and the corner arc begins). FRONT_UV_RECT/BACK_UV_RECT are ~839×1266px
    // of the 1678×1677 atlas — aspect ~0.663, NOT the mesh's true 0.716
    // aspect. That ~8% mismatch means a plain pixel-space circle or "cover"
    // fit drawn straight into the rect renders on the actual 3D card
    // visibly flattened/stretched horizontally. `inMeshSpace` below opens a
    // per-rect coordinate space that cancels this out, so ordinary isotropic
    // pixel math inside it comes out true on the rendered card.
    const CARD_MESH_WIDTH = 0.7164179086685181;
    const CARD_MESH_HEIGHT = 1.0000001192092896;
    const CARD_MESH_CORNER_RADIUS = 0.0386; // measured, not guessed
    const FRAME_MESH = 0.018; // dark frame thickness, same mesh units as above
    const PAD_MESH = 0.014; // gap between inner card edge and its content
    const PHOTO_H = 0.6; // photo height as fraction of inner-card height

    // Concentric rounded-rect path (manual — no dependency on ctx.roundRect).
    const roundRectPath = (x: number, y: number, w: number, h: number, r: number) => {
      const rr = Math.max(0, Math.min(r, w / 2, h / 2));
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    };

    // Opens the mesh-corrected coordinate space for one UV rect: everything
    // drawn inside `draw`, using its localW/localH and the meshToLocal(...)
    // helper for any mesh-unit measurement (like the corner radius), comes
    // out at the correct real-world proportions once mapped onto the card.
    const inMeshSpace = (
      rect: typeof FRONT_UV_RECT,
      draw: (localW: number, localH: number, meshToLocal: (meshUnits: number) => number) => void
    ) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const scaleX = rw / CARD_MESH_WIDTH;
      const scaleY = rh / CARD_MESH_HEIGHT;
      const yRatio = scaleY / scaleX;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.scale(1, yRatio);
      draw(rw, rh / yRatio, (meshUnits: number) => meshUnits * scaleX);
      ctx.restore();
    };

    // Draw an image to "cover" a region (crop, never stretch), anchored to
    // the top so a portrait crops away the bottom instead of the middle.
    const coverTopAligned = (
      img: HTMLImageElement | HTMLCanvasElement,
      x: number, y: number, w: number, h: number
    ) => {
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, x + (w - dw) / 2, y, dw, dh);
    };

    // Full dark fill over the whole face first — the card mesh's own
    // silhouette is what actually clips this to a rounded shape. Filling
    // completely (not just a thin border) means the near-black clip/clamp
    // metal, which sits flush against the card, always meets a matching
    // dark tone at every edge, so any z-fight flicker there is invisible.
    const drawDarkFill = (rect: typeof FRONT_UV_RECT) => {
      const rx = rect.x * W, ry = rect.y * H, rw = rect.w * W, rh = rect.h * H;
      ctx.fillStyle = CARD_SHADOW;
      ctx.fillRect(rx, ry, rw, rh);
    };

    const drawPhotoFace = (rect: typeof FRONT_UV_RECT, img: HTMLImageElement | HTMLCanvasElement) => {
      drawDarkFill(rect);
      inMeshSpace(rect, (w, h, toLocal) => {
        const frame = toLocal(FRAME_MESH);
        const innerR = Math.max(0, toLocal(CARD_MESH_CORNER_RADIUS) - frame);
        const ix = frame, iy = frame, iw = w - 2 * frame, ih = h - 2 * frame;
        ctx.fillStyle = CARD_CREAM;
        roundRectPath(ix, iy, iw, ih, innerR);
        ctx.fill();

        const pad = toLocal(PAD_MESH);
        const photoR = Math.max(0, innerR - pad);
        const photoX = ix + pad;
        const photoY = iy + pad;
        const photoW = iw - 2 * pad;
        const photoH = ih * PHOTO_H;

        ctx.save();
        roundRectPath(photoX, photoY, photoW, photoH, photoR);
        ctx.clip();
        coverTopAligned(img, photoX, photoY, photoW, photoH);
        ctx.restore();

        // small bracketed tag in the photo's top-left corner (badge motif)
        const tagSize = Math.round(ih * 0.032);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = `500 ${tagSize}px "IBM Plex Mono", monospace`;
        ctx.fillStyle = CARD_CREAM;
        ctx.globalAlpha = 0.9;
        ctx.fillText('[ * ]', photoX + pad * 0.5, photoY + pad * 0.5);
        ctx.globalAlpha = 1;

        // name plate below the photo — sized up and pushed further down into
        // the previously near-empty lower band so it reads clearly at the
        // card's actual small on-screen size, not just at full-canvas zoom.
        const nameSize = Math.round(ih * 0.078);
        const nameY = photoY + photoH + ih * 0.1;
        ctx.textBaseline = 'alphabetic';
        ctx.font = `700 ${nameSize}px "IBM Plex Mono", monospace`;
        ctx.fillStyle = CARD_SHADOW;
        ctx.fillText(NAME, photoX, nameY);
        ctx.fillStyle = CARD_ACCENT;
        ctx.fillText('*', photoX + ctx.measureText(NAME).width + nameSize * 0.3, nameY - nameSize * 0.06);

        // accent underline
        ctx.fillStyle = CARD_ACCENT;
        ctx.fillRect(photoX, nameY + nameSize * 0.42, iw * 0.2, Math.max(2, nameSize * 0.08));

        // role — bigger and noticeably more opaque than before (was 0.5,
        // easy to lose against the cream card at the card's real render size)
        const roleSize = Math.round(ih * 0.046);
        ctx.font = `500 ${roleSize}px "IBM Plex Mono", monospace`;
        ctx.fillStyle = CARD_SHADOW;
        ctx.globalAlpha = 0.7;
        ctx.fillText(ROLE, photoX, nameY + nameSize * 1.05 + roleSize * 1.15);
        ctx.globalAlpha = 1;
      });
    };

    const drawPromptFace = (rect: typeof FRONT_UV_RECT, title: string, sub: string) => {
      drawDarkFill(rect);
      inMeshSpace(rect, (w, h, toLocal) => {
        const frame = toLocal(FRAME_MESH);
        const innerR = Math.max(0, toLocal(CARD_MESH_CORNER_RADIUS) - frame);
        ctx.fillStyle = CARD_CREAM;
        roundRectPath(frame, frame, w - 2 * frame, h - 2 * frame, innerR);
        ctx.fill();

        const cx = w / 2;
        const cy = h / 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const titleSize = Math.round(h * 0.075);
        ctx.fillStyle = CARD_ACCENT;
        ctx.font = `700 ${titleSize}px "IBM Plex Mono", monospace`;
        ctx.fillText('*', cx, cy - titleSize * 1.6);

        ctx.fillStyle = CARD_SHADOW;
        ctx.fillText(title, cx, cy - titleSize * 0.2);

        const subSize = Math.round(h * 0.038);
        ctx.font = `400 ${subSize}px "IBM Plex Mono", monospace`;
        ctx.globalAlpha = 0.55;
        ctx.fillText(sub, cx, cy + titleSize * 0.9);
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
      });
    };

    const frontPhoto =
      frontImage && frontTex.image
        ? createDuotoneImage(uprightForPortrait(frontTex.image as HTMLImageElement), CARD_SHADOW, CARD_CREAM)
        : null;
    const backPhoto =
      backImage && backTex.image
        ? createDuotoneImage(uprightForPortrait(backTex.image as HTMLImageElement), CARD_SHADOW, CARD_CREAM)
        : null;

    if (frontPhoto) drawPhotoFace(FRONT_UV_RECT, frontPhoto);
    else drawPromptFace(FRONT_UV_RECT, FRONT_PROMPT.title, FRONT_PROMPT.sub);

    if (backPhoto) drawPhotoFace(BACK_UV_RECT, backPhoto);
    else drawPromptFace(BACK_UV_RECT, 'TWOJE ZDJĘCIE', 'podmień: frontImage / backImage');

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base.map, lang]);
  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    c.curveType = 'chordal';
    return c;
  });
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    // Keep the card's actual visible edges (not just its origin point) away
    // from the canvas's true edge on all four sides — a <canvas> only ever
    // draws inside its own pixel rect, so anything that swings past it isn't
    // "hidden" by CSS, it's simply never drawn there at all. No overflow or
    // clip-path rule can put those pixels back; the only fix is keeping the
    // card inside the frame in the first place. state.viewport gives the
    // *live* world-space size of that frame at the card's distance — computed
    // fresh every frame straight from the real camera/canvas, so this stays
    // correct across resizes without duplicating fov/aspect trig by hand.
    const halfW = state.viewport.width / 2;
    const halfH = state.viewport.height / 2;
    // General safety margin on the sides with no other constraint (left,
    // right, bottom). The top uses dragCeilingFraction instead when given —
    // that one is tied to a specific CSS crop (see PortfolioLanyard's HERO_CLIP)
    // rather than a generic margin.
    const EDGE_MARGIN = 0.06;
    const maxX = halfW * (1 - EDGE_MARGIN) - CARD_VISUAL_HALF_WIDTH;
    const minX = -maxX;
    const minY = -halfH * (1 - EDGE_MARGIN) - CARD_VISUAL_BOTTOM_OFFSET;
    const maxY = dragCeilingFraction != null
      ? halfH - dragCeilingFraction * halfH * 2 - CARD_VISUAL_TOP_OFFSET
      : halfH * (1 - EDGE_MARGIN) - CARD_VISUAL_TOP_OFFSET;

    if (dragged && typeof dragged !== 'boolean') {
      // state.pointer is normalized to the canvas's own rect ([-1, 1] on
      // each axis exactly at its edges) — once the cursor leaves that rect
      // the value goes beyond ±1, which is the cheapest reliable "cursor
      // exited the working area" check without a separate DOM listener.
      // Pointer capture would otherwise keep the drag going indefinitely
      // even far outside the canvas.
      const cursorOutside = Math.abs(state.pointer.x) > 1 || Math.abs(state.pointer.y) > 1;
      if (cursorOutside) {
        drag(false);
      } else {
        vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
        dir.copy(vec).sub(state.camera.position).normalize();
        vec.add(dir.multiplyScalar(state.camera.position.length()));
        [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
        card.current?.setNextKinematicTranslation({
          x: Math.min(Math.max(vec.x - dragged.x, minX), maxX),
          y: Math.min(Math.max(vec.y - dragged.y, minY), maxY),
          z: vec.z - dragged.z,
        });
      }
    } else if (card.current) {
      // Not being dragged — the pendulum swings freely under the physics
      // solver and can overshoot past any of these lines on momentum alone
      // (e.g. right after a drag-release, or during the initial drop). The
      // drag path above only clamps the *target* while a kinematic drag is
      // driving it; a free (dynamic) swing needs its own correction, so
      // gently stop it at the same lines instead of letting it swing into
      // the part of the scene the canvas never draws.
      const t = card.current.translation();
      if (!ceilingArmed.current && t.y <= maxY) ceilingArmed.current = true;
      const cx = Math.min(Math.max(t.x, minX), maxX);
      // Floor and sides always apply; the ceiling only once armed (see
      // ceilingArmed) — until then the card is still dropping in from above.
      const cy = ceilingArmed.current
        ? Math.min(Math.max(t.y, minY), maxY)
        : Math.max(t.y, minY);
      if (cx !== t.x || cy !== t.y) {
        card.current.setTranslation({ x: cx, y: cy, z: t.z }, true);
        const v = card.current.linvel();
        card.current.setLinvel(
          { x: cx !== t.x ? 0 : v.x, y: cy !== t.y ? 0 : v.y, z: v.z },
          true
        );
      }
    }
    if (fixed.current) {
      ([
        [j1, j1Obj],
        [j2, j2Obj],
      ] as const).forEach(([ref, objRef]) => {
        const lerped = getLerped(ref.current, objRef.current);
        objRef.current.getWorldPosition(currentPos);
        const clampedDistance = Math.max(0.1, Math.min(1, lerped.distanceTo(currentPos)));
        lerped.lerp(currentPos, delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      j3Obj.current.getWorldPosition(curve.points[0]);
      curve.points[1].copy(getLerped(j2.current, j2Obj.current));
      curve.points[2].copy(getLerped(j1.current, j1Obj.current));
      fixedObj.current.getWorldPosition(curve.points[3]);
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      // Steer the card's Y rotation toward the currently-selected face and
      // hold it there (front = 0, back = π). Reading the Y angle straight from
      // the quaternion assumes rotation is Y-dominant, which holds because the
      // pendulum swing about the other axes stays small. The velocity we inject
      // is proportional to the wrapped angular error, so it eases in as the
      // card nears the target and — combined with the joints' angularDamping —
      // settles without endless spin, on whichever face was chosen.
      ang.copy(card.current.angvel());
      const q = card.current.rotation();
      const theta = 2 * Math.atan2(q.y, q.w);
      let faceErr = targetFaceAngle.current - theta;
      faceErr = Math.atan2(Math.sin(faceErr), Math.cos(faceErr));
      card.current.setAngvel({ x: ang.x, y: ang.y + faceErr * FACE_HOLD_K, z: ang.z }, true);
    }
  });

  useEffect(() => {
    // A THREE.Texture is a plain mutable object, not React state — this rule
    // is aimed at hook-returned values in general and doesn't know the
    // difference, but setting wrap mode here is the standard/safe way to
    // configure a loaded texture.
    // eslint-disable-next-line react-hooks/immutability
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed">
          <group ref={fixedObj} />
        </RigidBody>
        <RigidBody position={introLink(1)} ref={j1} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
          <group ref={j1Obj} />
        </RigidBody>
        <RigidBody position={introLink(2)} ref={j2} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
          <group ref={j2Obj} />
        </RigidBody>
        <RigidBody position={introLink(3)} ref={j3} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
          <group ref={j3Obj} />
        </RigidBody>
        <RigidBody position={INTRO_CARD_POSITION} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              (e.target as Element).releasePointerCapture(e.pointerId);

              const wasClick = dragTimer.current !== null;
              if (dragTimer.current) {
                clearTimeout(dragTimer.current);
                dragTimer.current = null;
              }
              drag(false);

              if (wasClick && card.current) {
                // Released before the hold-to-drag timer ever fired — drag mode
                // was never entered, so this is unambiguously a tap: flip the
                // card to its other face. Toggle the target the useFrame
                // controller steers toward, then give it a Y-axis torque kick
                // in the right direction so the flip is snappy instead of a
                // slow creep. The controller catches it and holds it on the
                // new face. (The body may still be kinematic from a just-ended
                // interaction — force it dynamic first or the impulse is a
                // no-op, since kinematic bodies ignore impulses.)
                card.current.setBodyType(0, true);
                targetFaceAngle.current = targetFaceAngle.current === 0 ? Math.PI : 0;

                const q = card.current.rotation();
                const theta = 2 * Math.atan2(q.y, q.w);
                let err = targetFaceAngle.current - theta;
                err = Math.atan2(Math.sin(err), Math.cos(err));
                const flipDir = Math.sign(err) || 1;
                card.current.applyTorqueImpulse({ x: 0, y: flipDir * FLIP_IMPULSE, z: 0 }, true);

                onFlipClick?.();
              }
            }}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              (e.target as Element).setPointerCapture(e.pointerId);
              const t = card.current.translation();
              pendingDragOffset.current.copy(e.point).sub(vec.copy(t));
              dragTimer.current = setTimeout(() => {
                dragTimer.current = null;
                drag(pendingDragOffset.current.clone());
              }, HOLD_TO_DRAG_MS);
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={[{ resolution: new THREE.Vector2(...(isMobile ? [1000, 2000] : [1000, 1000])) }]}
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap={1}
          map={texture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(CARD_GLB_URL);
