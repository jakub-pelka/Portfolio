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
import styles from './LanyardReactBits.module.css';

const CARD_GLB_URL = '/lanyard/card.glb';
const LANYARD_TEXTURE_URL = '/lanyard/lanyard.png';

extend({ MeshLineGeometry, MeshLineMaterial });

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
          />
        </Physics>
        <Environment blur={0.75}>
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

export default function Lanyard(props: LanyardProps) {
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
    <div ref={stageRef} className={styles.stage}>
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
  const texture = useTexture(lanyardImage || LANYARD_TEXTURE_URL);
  // useTexture must be called unconditionally; use a blank pixel when an image
  // isn't supplied for a given face, then skip compositing it below.
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // Composite the front/back images into the card's texture atlas (front = left
  // half, back = right half). Each image is drawn aspect-preserving (no stretch).
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map as THREE.Texture;
    if (!frontImage && !backImage) return baseMap;

    const baseImg = baseMap.image as HTMLImageElement;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    // Keep the original baked atlas for the card edges and any untouched face.
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img: HTMLImageElement, rect: typeof FRONT_UV_RECT) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontImage && frontTex.image) drawFitted(frontTex.image as HTMLImageElement, FRONT_UV_RECT);
    if (backImage && backTex.image) drawFitted(backTex.image as HTMLImageElement, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base.map]);
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
          x: vec.x - dragged.x,
          y: vec.y - dragged.y,
          z: vec.z - dragged.z,
        });
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
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
          <group ref={j1Obj} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
          <group ref={j2Obj} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
          <group ref={j3Obj} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
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
