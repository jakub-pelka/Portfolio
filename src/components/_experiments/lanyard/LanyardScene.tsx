'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { Canvas, extend, useFrame, useThree, type ThreeElement, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import {
  Physics,
  RigidBody,
  CuboidCollider,
  BallCollider,
  useSphericalJoint,
  type RapierRigidBody,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { createPlaceholderCardTexture } from './createPlaceholderCardTexture';
import styles from './LanyardScene.module.css';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

// Rapier's core RigidBodyType enum (stable across versions). Defined locally
// instead of imported from '@dimforge/rapier3d-compat' because this repo ends
// up with two resolvable copies of that package (a stray top-level one pulled
// in transitively, and the one nested under @react-three/rapier) — importing
// the enum risks silently grabbing the wrong copy.
const RigidBodyType = { Dynamic: 0, KinematicPositionBased: 2 } as const;

const CARD_WIDTH = 1.6;
const CARD_HEIGHT = 2.25;
const CARD_DEPTH = 0.06;
const ANCHOR_Y = 4;
const SEGMENT_LENGTH = 0.55;
const SEGMENT_RADIUS = 0.09;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const CARD_REST_Y = ANCHOR_Y - SEGMENT_LENGTH * 3 - CARD_HEIGHT / 2;
const CAMERA_LOOK_AT_Y = (ANCHOR_Y + CARD_REST_Y) / 2;

// R3F positions the default camera but doesn't aim it at the origin — without
// this the rig (anchor near the top, card hanging below) drifts out of the
// frustum since the camera keeps its default "looking down -Z" orientation.
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, CAMERA_LOOK_AT_Y, 0);
  }, [camera]);
  return null;
}

interface CardFaceProps {
  texture: THREE.Texture;
}

function CardFace({ texture }: CardFaceProps) {
  // Plain box, not drei's RoundedBox: RoundedBox's UV layout isn't a simple
  // 0-1 map per face, so a single square texture lands warped into a corner
  // instead of covering the front face. The canvas texture already draws its
  // own inset border, so the geometry doesn't need rounded corners to read as
  // a "card."
  return (
    <mesh>
      <boxGeometry args={[CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH]} />
      <meshStandardMaterial map={texture} roughness={0.45} metalness={0.05} />
    </mesh>
  );
}

function PlaceholderCardFace() {
  // Mount the mesh only once the texture exists — a meshStandardMaterial
  // created without a `map` compiles a shader without USE_MAP, and later
  // assigning `map` doesn't get picked up without also flipping
  // material.needsUpdate. Simplest fix: never render with map=undefined.
  const [texture, setTexture] = useState<THREE.CanvasTexture | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const build = () => {
      if (cancelled) return;
      setTexture(createPlaceholderCardTexture(CARD_HEIGHT / CARD_WIDTH));
    };
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(build);
    } else {
      build();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  if (!texture) return null;
  return <CardFace texture={texture} />;
}

function ImageCardFace({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);
  return <CardFace texture={texture} />;
}

interface LanyardRigProps {
  imageUrl?: string;
}

function LanyardRig({ imageUrl }: LanyardRigProps) {
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);
  const band = useRef<{ geometry: MeshLineGeometry } & THREE.Object3D>(null);

  const { size } = useThree();
  const [dragged, setDragged] = useState(false);
  const dragPlane = useMemo(() => new THREE.Plane(), []);
  const dragAnchor = useRef(new THREE.Vector3());
  const lastDragPoint = useRef(new THREE.Vector3());
  const velocity = useRef(new THREE.Vector3());
  const dragEuler = useRef(new THREE.Euler());
  const dragQuat = useRef(new THREE.Quaternion());
  const curvePoints = useMemo(
    () => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()],
    []
  );

  // useSphericalJoint (not useRopeJoint) for every link: a rope joint only
  // caps the *maximum* distance between bodies, it doesn't resist getting
  // closer — under gravity each segment free-falls toward its neighbor and
  // then snaps taut every step, which reads as continuous spring-like
  // bouncing. A spherical joint pins two anchor points together exactly (no
  // slack either way), so offsetting each anchor by half a segment's length
  // gives a fixed-length rigid link that can still swing/rotate freely at
  // every joint — a proper multi-link pendulum instead of a bungee cord.
  type JointRef = RefObject<RapierRigidBody>;
  const half = SEGMENT_LENGTH / 2;

  useSphericalJoint(fixed as JointRef, j1 as JointRef, [[0, 0, 0], [0, half, 0]]);
  useSphericalJoint(j1 as JointRef, j2 as JointRef, [[0, -half, 0], [0, half, 0]]);
  useSphericalJoint(j2 as JointRef, j3 as JointRef, [[0, -half, 0], [0, half, 0]]);
  useSphericalJoint(j3 as JointRef, card as JointRef, [[0, -half, 0], [0, CARD_HEIGHT / 2, 0]]);

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    if (!card.current) return;
    const t = card.current.translation();
    dragAnchor.current.set(t.x, t.y, t.z);
    lastDragPoint.current.copy(dragAnchor.current);
    velocity.current.set(0, 0, 0);
    card.current.setBodyType(RigidBodyType.KinematicPositionBased, true);
    setDragged(true);
    document.body.style.cursor = 'grabbing';
  }, []);

  const handlePointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    (e.target as Element).releasePointerCapture(e.pointerId);
    setDragged(false);
    document.body.style.cursor = 'grab';
    if (!card.current) return;
    card.current.setBodyType(RigidBodyType.Dynamic, true);
    card.current.setLinvel(
      { x: velocity.current.x, y: velocity.current.y, z: velocity.current.z },
      true
    );
  }, []);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      const normal = new THREE.Vector3();
      state.camera.getWorldDirection(normal);
      dragPlane.setFromNormalAndCoplanarPoint(normal, dragAnchor.current);
      state.raycaster.setFromCamera(state.pointer, state.camera);
      const hit = new THREE.Vector3();
      if (state.raycaster.ray.intersectPlane(dragPlane, hit)) {
        const dt = Math.max(delta, 1 / 144);
        velocity.current.set(
          (hit.x - lastDragPoint.current.x) / dt,
          (hit.y - lastDragPoint.current.y) / dt,
          (hit.z - lastDragPoint.current.z) / dt
        );
        lastDragPoint.current.copy(hit);
        card.current.setNextKinematicTranslation(hit);

        // Kinematic bodies only move where you put them — rotation isn't a
        // side effect of translation, so the tilt-while-dragging has to be
        // driven explicitly from drag velocity here.
        dragEuler.current.set(
          clamp(-velocity.current.y * 0.03, -0.4, 0.4),
          clamp(velocity.current.x * 0.045, -0.6, 0.6),
          clamp((hit.x - dragAnchor.current.x) * 0.12, -0.5, 0.5)
        );
        dragQuat.current.setFromEuler(dragEuler.current);
        card.current.setNextKinematicRotation(dragQuat.current);
      }
    }

    if (band.current && fixed.current && j1.current && j2.current && j3.current) {
      curvePoints[0].copy(fixed.current.translation());
      curvePoints[1].copy(j1.current.translation());
      curvePoints[2].copy(j2.current.translation());
      curvePoints[3].copy(j3.current.translation());
      band.current.geometry.setPoints(curvePoints);
    }
  });

  return (
    <>
      <RigidBody ref={fixed} type="fixed" position={[0, ANCHOR_Y, 0]} />
      <RigidBody
        ref={j1}
        type="dynamic"
        position={[0, ANCHOR_Y - SEGMENT_LENGTH * 0.5, 0]}
        angularDamping={4}
        linearDamping={4}
        colliders={false}
      >
        <BallCollider args={[SEGMENT_RADIUS]} />
      </RigidBody>
      <RigidBody
        ref={j2}
        type="dynamic"
        position={[0, ANCHOR_Y - SEGMENT_LENGTH * 1.5, 0]}
        angularDamping={4}
        linearDamping={4}
        colliders={false}
      >
        <BallCollider args={[SEGMENT_RADIUS]} />
      </RigidBody>
      <RigidBody
        ref={j3}
        type="dynamic"
        position={[0, ANCHOR_Y - SEGMENT_LENGTH * 2.5, 0]}
        angularDamping={4}
        linearDamping={4}
        colliders={false}
      >
        <BallCollider args={[SEGMENT_RADIUS]} />
      </RigidBody>
      <RigidBody
        ref={card}
        type="dynamic"
        position={[0, CARD_REST_Y, 0]}
        angularDamping={2.5}
        linearDamping={2}
        colliders={false}
      >
        <CuboidCollider args={[CARD_WIDTH / 2, CARD_HEIGHT / 2, CARD_DEPTH / 2]} />
        <group
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerOver={() => {
            document.body.style.cursor = 'grab';
          }}
          onPointerOut={() => {
            if (!dragged) document.body.style.cursor = 'auto';
          }}
        >
          {imageUrl ? <ImageCardFace imageUrl={imageUrl} /> : <PlaceholderCardFace />}
        </group>
      </RigidBody>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={[{ resolution: new THREE.Vector2(size.width, size.height) }]}
          color="#1c1c1c"
          lineWidth={0.045}
          transparent
          opacity={0.85}
          resolution={[size.width, size.height]}
        />
      </mesh>
    </>
  );
}

export interface LanyardSceneProps {
  imageUrl?: string;
}

export function LanyardScene({ imageUrl }: LanyardSceneProps) {
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
      {active && (
        <Canvas camera={{ position: [0, CAMERA_LOOK_AT_Y, 11], fov: 30 }}>
          <CameraRig />
          <ambientLight intensity={1.2} />
          <directionalLight position={[3, 5, 4]} intensity={1.6} />
          <Suspense fallback={null}>
            <Physics gravity={[0, -32, 0]} interpolate>
              <LanyardRig imageUrl={imageUrl} />
            </Physics>
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
