import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../store';

const fragments = [
  { pos: [-2.8, 1.5, -2], color: '#c8d8f0', label: 'ABOUT US', action: 'aboutUs', big: true },
  { pos: [2.0, -1, -2.5], color: '#d4b870', label: null, action: null, big: false },
  { pos: [-2.2, -1.2, -1.5], color: '#b0b8e0', label: null, action: null, big: false },
  { pos: [2.2, 1.8, -3], color: '#e0c890', label: 'TEAM', action: 'team', big: true },
  { pos: [-0.5, 2.5, -3.5], color: '#c0c8f0', label: null, action: null, big: false },
];

function GlassFragment({ startPos, color, label, action, big }) {
  const ref = useRef();
  const labelRef = useRef();
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const r = big ? 0.14 : 0.08;
  const offset = useRef({ sx: (Math.random() - 0.5) * 2, sy: (Math.random() - 0.5) * 2, speed: 0.15 + Math.random() * 0.35 });
  const setAboutUsVisible = useStore((s) => s.setAboutUsVisible);
  const setTeamVisible = useStore((s) => s.setTeamVisible);

  const tex = useMemo(() => {
    if (!label) return null;
    const c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.font = '300 18px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, 128, 32);
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.needsUpdate = true;
    return t;
  }, [label, color]);

  const handleClick = () => {
    if (!action) return;
    if (!clicked) {
      setClicked(true);
    } else {
      setClicked(false);
      useStore.getState().setActivePortal(null); if (action === 'aboutUs') setAboutUsVisible(true);
      useStore.getState().setActivePortal(null); if (action === 'team') setTeamVisible(true);
    }
  };

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const o = offset.current;
    const x = startPos[0] + Math.sin(t * o.speed + o.sx) * 0.6;
    const y = startPos[1] + Math.cos(t * o.speed * 0.7 + o.sy) * 0.5;
    const z = startPos[2] + Math.cos(t * o.speed * 0.5) * 0.3;
    ref.current.position.set(x, y, z);
    if (labelRef.current) {
      labelRef.current.position.set(x, y + r * 2, z);
      labelRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <>
      <group ref={ref} position={startPos}>
        <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onClick={handleClick}>
          <sphereGeometry args={[r, 16, 16]} />
          <meshPhysicalMaterial color={color} roughness={0.1} metalness={0.1} transparent opacity={hovered || clicked ? 0.6 : 0.4} envMapIntensity={0.3} />
        </mesh>
        <mesh>
          <sphereGeometry args={[r * 0.75, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={hovered || clicked ? 0.35 : 0.2} depthWrite={false} />
        </mesh>
      </group>
      {label && tex && (hovered || clicked) && (
        <group ref={labelRef}>
          <mesh><planeGeometry args={[1.2, 0.3]} /><meshBasicMaterial map={tex} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} /></mesh>
        </group>
      )}
    </>
  );
}

export default function ConsciousnessLayer() {
  return (
    <>
      {fragments.map((f, i) => (<GlassFragment key={i} startPos={f.pos} color={f.color} label={f.label} action={f.action} big={f.big} />))}
    </>
  );
}

