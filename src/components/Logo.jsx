import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import useStore from "../store";

function useHiResSvgTexture(svgUrl) {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    const scale = 4;
    const img = new Image();
    img.onload = () => {
      const w = (img.naturalWidth || 512) * scale;
      const h = (img.naturalHeight || 512) * scale;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const t = new THREE.CanvasTexture(c);
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = true;
      t.premultiplyAlpha = true;
      t.needsUpdate = true;
      setTex(t);
    };
    img.src = svgUrl;
  }, [svgUrl]);
  return tex;
}

const glowTexture = (() => {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, s * 0.12, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255, 250, 240, 0.55)");
  g.addColorStop(0.15, "rgba(255, 248, 235, 0.3)");
  g.addColorStop(0.4, "rgba(255, 240, 220, 0.08)");
  g.addColorStop(0.7, "rgba(255, 235, 210, 0.015)");
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

export default function BreathingIcon() {
  const groupRef = useRef();
  const glowRef = useRef();
  const logoRef = useRef();
  const iconTex = useHiResSvgTexture("/assets/logo-icon.svg");
  const { viewport } = useThree();
  const stage = useStore((s) => s.stage);
  const collapseStart = useRef(null);

  useEffect(() => { collapseStart.current = null; }, [stage]);

  const logoSize = useMemo(() => {
    const minDim = Math.min(viewport.width, viewport.height);
    return minDim * 0.35;
  }, [viewport.width, viewport.height]);

  const advance = () => {
    if (useStore.getState().stage === 0) {
      useStore.getState().setStage(1);
      setTimeout(() => useStore.getState().setStage(2), 1400);
    }
  };

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    if (stage === 0) {
      collapseStart.current = null;
      const breath = 1.0 + Math.sin(t * 0.4) * 0.035 + Math.sin(t * 0.7 + 1.2) * 0.025;
      groupRef.current.scale.setScalar(breath);
      groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.015;
      if (glowRef.current) glowRef.current.material.opacity = 0.7;
      if (logoRef.current) logoRef.current.material.opacity = 0.95;
      groupRef.current.position.z = 0;
    } else if (stage === 1) {
      if (!collapseStart.current) collapseStart.current = t;
      const elapsed = t - collapseStart.current;
      const progress = Math.min(elapsed / 1.0, 1.0);
      const ease = 1 - Math.pow(1 - progress, 3);
      groupRef.current.scale.setScalar(1.0 - ease * 0.98);
      groupRef.current.position.z = ease * 5;
      if (glowRef.current) glowRef.current.material.opacity = 0.7 * (1 - ease);
      if (logoRef.current) logoRef.current.material.opacity = 0.95 * (1 - ease);
    }
  });

  if (!iconTex) return null;
  const glowSize = logoSize * 2.5;

  return (
    <group ref={groupRef}>
      <mesh ref={glowRef} position={[0, 0, -0.15]}>
        <planeGeometry args={[glowSize, glowSize]} />
        <meshBasicMaterial map={glowTexture} transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={logoRef} onClick={advance}>
        <planeGeometry args={[logoSize, logoSize]} />
        <meshStandardMaterial map={iconTex} transparent opacity={0.95} roughness={0.2} metalness={0} emissive="#ffffff" emissiveIntensity={0.6} emissiveMap={iconTex} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
