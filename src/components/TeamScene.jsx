import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const teamMembers = [
  { name: '谭朗月', title: '创始合伙人 | 技术总监', file: '/assets/team/谭朗月.png', pos: [0, 2.8, -1.5] },
  { name: '陈林', title: '创始人', file: '/assets/team/陈林.png', pos: [-2.0, 2.0, -1] },
  { name: '雷和平', title: '艺术总监', file: '/assets/team/雷和平.png', pos: [2.0, 2.0, -1] },
  { name: '王羽婷', title: '品牌总监', file: '/assets/team/王羽婷.png', pos: [-2.0, -1.8, -1] },
  { name: '李潇翔', title: '运营总监', file: '/assets/team/李潇翔.png', pos: [2.0, -1.8, -1] },
];

const blueGlowTex = (() => {
  const s = 128; const c = document.createElement('canvas'); c.width = s; c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, s * 0.15, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(70, 110, 220, 0.7)');
  g.addColorStop(0.25, 'rgba(50, 90, 180, 0.35)'); g.addColorStop(0.6, 'rgba(20, 50, 120, 0.06)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
})();

function useCircleImage(url) {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 512; const c = document.createElement('canvas'); c.width = size; c.height = size;
      const ctx = c.getContext('2d');
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2; const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.fill();
      const t = new THREE.CanvasTexture(c);
      t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = true; t.needsUpdate = true; setTex(t);
    }; img.src = url;
  }, [url]); return tex;
}

function MemberBall({ member, index }) {
  const groupRef = useRef();
  const faceRef = useRef();
  const tex = useCircleImage(member.file);
  const [active, setActive] = useState(false);
  const { camera, viewport } = useThree();
  const floatOffset = useRef({
    sx: (Math.random() - 0.5) * 2, sy: (Math.random() - 0.5) * 2,
    speedX: 0.15 + Math.random() * 0.25, speedY: 0.12 + Math.random() * 0.2,
    phaseX: Math.random() * Math.PI * 2, phaseY: Math.random() * Math.PI * 2,
  });

  const aspect = viewport.width / viewport.height;
  const t = Math.max(0, Math.min(1, (aspect - 0.8) / 0.4));
  const viewScale = 0.65 + (1.0 - 0.65) * t;
  const sx = member.pos[0] * viewScale; const sy = member.pos[1] * viewScale;
  const r = 0.45;
  const moveAmp = 0.25 + 0.35 * t;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const ct = clock.elapsedTime;
    const o = floatOffset.current;
    groupRef.current.position.x = sx + Math.sin(ct * o.speedX + o.phaseX) * moveAmp;
    groupRef.current.position.y = sy + Math.cos(ct * o.speedY + o.phaseY) * moveAmp;
    groupRef.current.position.z = member.pos[2] + Math.cos(ct * 0.15 + o.sx) * moveAmp * 0.5;
    const breath = 1.0 + Math.sin(ct * 0.35 + index * 0.8) * 0.04;
    groupRef.current.scale.setScalar(breath);
    if (faceRef.current) faceRef.current.quaternion.copy(camera.quaternion);
  });

  if (!tex) return null;

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.3]}>
        <planeGeometry args={[r * 5, r * 5]} />
        <meshBasicMaterial map={blueGlowTex} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={faceRef} onClick={() => setActive(!active)}>
        <planeGeometry args={[r * 2, r * 2]} />
        <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {active && <MemberLabel member={member} r={r} />}
    </group>
  );
}

function MemberLabel({ member, r }) {
  const ref = useRef(); const { camera } = useThree();
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '300 28px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(member.name, 256, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '300 16px Inter, sans-serif'; ctx.fillText(member.title, 256, 58);
    const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; t.needsUpdate = true; return t;
  }, [member.name, member.title]);
  useFrame(() => { if (ref.current) ref.current.quaternion.copy(camera.quaternion); });
  return (
    <mesh ref={ref} position={[0, -r - 0.35, 0]}>
      <planeGeometry args={[2.0, 0.5]} />
      <meshBasicMaterial map={tex} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

export default function TeamScene() {
  return (<>{teamMembers.map((m, i) => (<MemberBall key={m.name} member={m} index={i} />))}</>);
}

