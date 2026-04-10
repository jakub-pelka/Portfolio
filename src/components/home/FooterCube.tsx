'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function FooterCube() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.2, 1.6, 2.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Wireframe cube via EdgesGeometry
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.6,
    });
    const cube = new THREE.LineSegments(edges, material);
    scene.add(cube);

    // Slow continuous rotation
    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      cube.rotation.x += 0.004;
      cube.rotation.y += 0.006;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      renderer.dispose();
      geometry.dispose();
      edges.dispose();
      material.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}
