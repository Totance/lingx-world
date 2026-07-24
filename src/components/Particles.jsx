import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Particles({ count = 100 }) {
  const mesh = useRef();
  const velocitiesRef = useRef(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      vel[i * 3] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return [pos, vel];
  }, [count]);

  velocitiesRef.current = velocities;

  const sprite = useMemo(() => {
    const canvas = document.createElement("canvas");
    const s = 64;
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gradient.addColorStop(0, "rgba(255, 252, 245, 0.7)");
    gradient.addColorStop(0.15, "rgba(255, 252, 245, 0.4)");
    gradient.addColorStop(0.4, "rgba(255, 252, 245, 0.1)");
    gradient.addColorStop(0.7, "rgba(255, 252, 245, 0.02)");
    gradient.addColorStop(1, "rgba(255, 252, 245, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame(({ mouse }) => {
    if (!mesh.current) return;
    const geometry = mesh.current.geometry;
    const posArray = geometry.attributes.position.array;
    const vel = velocitiesRef.current;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArray[i3] += vel[i3];
      posArray[i3 + 1] += vel[i3 + 1];
      posArray[i3 + 2] += vel[i3 + 2];

      const x = posArray[i3], y = posArray[i3 + 1], z = posArray[i3 + 2];
      const dist = Math.sqrt(x * x + y * y + z * z);
      if (dist > 7.5) {
        const s = 3 / dist;
        posArray[i3] *= s;
        posArray[i3 + 1] *= s;
        posArray[i3 + 2] *= s;
        vel[i3] = (Math.random() - 0.5) * 0.005;
        vel[i3 + 1] = (Math.random() - 0.5) * 0.005;
        vel[i3 + 2] = (Math.random() - 0.5) * 0.005;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    mesh.current.rotation.y = -mouse.x * 0.04;
    mesh.current.rotation.x = -mouse.y * 0.04;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.28}
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#fffdf5"
      />
    </points>
  );
}
