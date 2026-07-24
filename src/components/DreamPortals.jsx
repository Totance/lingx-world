import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../store";
import { PortalAInterior, PortalBInterior } from "./PortalInteriors";

const blueGlowTexture = (() => {
  const s = 256; const c = document.createElement("canvas"); c.width = s; c.height = s;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, s * 0.15, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(60, 100, 200, 0.7)"); g.addColorStop(0.3, "rgba(40, 80, 160, 0.35)");
  g.addColorStop(0.6, "rgba(10, 30, 80, 0.04)"); g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
})();

function BillboardContent({ children }) {
  const ref = useRef(); const { camera } = useThree();
  useFrame(() => { if (ref.current) ref.current.quaternion.copy(camera.quaternion); });
  return <group ref={ref}>{children}</group>;
}

function PortalLabel({ text, sub, color, offsetY = -2.2 }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas"); c.width = 512; c.height = 160;
    const ctx = c.getContext("2d");
    ctx.fillStyle = color; ctx.globalAlpha = 0.7; ctx.font = "300 36px Inter, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(text, 256, 16);
    ctx.globalAlpha = 0.4; ctx.font = "300 20px Inter, sans-serif"; ctx.fillText(sub, 256, 64);
    const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.needsUpdate = true;
    return t;
  }, [text, sub, color]);
  return <mesh position={[0, offsetY, 0]}><planeGeometry args={[3.0, 0.9]} /><meshBasicMaterial map={tex} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} /></mesh>;
}

function Portal({ color, hoverColor, title, subtitle, interior, portalKey }) {
  const groupRef = useRef();
  const sphereRef = useRef(); const imageRef = useRef(); const followRef = useRef();
  const rimRef = useRef(); const haloRef = useRef();
  const [hovered, setHovered] = useState(false);
  const floatOffset = useRef((Math.random() - 0.5) * 2);
  const fadeStart = useRef(null);
  const SPHERE_R = 1.12;
  const stage = useStore((s) => s.stage);
  const activePortal = useStore((s) => s.activePortal);
  const expandedPortal = useStore((s) => s.expandedPortal);
  const setActivePortal = useStore((s) => s.setActivePortal);
  const setExpandedPortal = useStore((s) => s.setExpandedPortal);
  const setPortalScreenPos = useStore((s) => s.setPortalScreenPos);
  const { camera, size, viewport } = useThree();

  useEffect(() => { fadeStart.current = null; }, [stage]);

  const isPortrait = viewport.width / viewport.height < 1.2;
  const normPos = isPortrait
    ? (portalKey === "portalA" ? { x: 0, y: 2.0, z: -1 } : { x: 0, y: -1.5, z: -1 })
    : (portalKey === "portalA" ? { x: -2.8, y: 0, z: -1 } : { x: 2.8, y: 0, z: -1 });

  const otherExiled = expandedPortal && expandedPortal !== portalKey;
  const exileTarget = portalKey === "portalA" ? -12 : 12;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!fadeStart.current) fadeStart.current = t;
    const fadingOut = stage === 3;
    const elapsed = t - fadeStart.current; let fe;
    if (fadingOut) { fe = Math.max(0, 1 - elapsed / 1.0); }
    else { const fade = Math.min(elapsed / 1.5, 1.0); fe = 1 - Math.pow(1 - fade, 3); }

    const y = normPos.y + Math.sin(t * 0.4 + floatOffset.current) * 0.15;
    const targetX = otherExiled ? exileTarget : normPos.x;

    if (groupRef.current) {
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.05;
      groupRef.current.position.z += (normPos.z - groupRef.current.position.z) * 0.03;
    }
    if (sphereRef.current) { sphereRef.current.position.y = y; sphereRef.current.rotation.y = t * 0.15; }
    if (imageRef.current) imageRef.current.position.y = y;
    if (followRef.current) followRef.current.position.y = y;

    if (activePortal === portalKey) {
      const wp = new THREE.Vector3(groupRef.current.position.x, sphereRef.current ? sphereRef.current.position.y : normPos.y, groupRef.current.position.z);
      wp.project(camera);
      setPortalScreenPos({ x: (wp.x * 0.5 + 0.5) * size.width, y: (-wp.y * 0.5 + 0.5) * size.height });
    }

    const tRim = hovered && !fadingOut ? 0.3 : 0.2;
    const tHalo = hovered && !fadingOut ? 0.7 : 0.5;
    if (rimRef.current) rimRef.current.material.opacity += (tRim * fe - rimRef.current.material.opacity) * 0.08;
    if (haloRef.current) haloRef.current.material.opacity += (tHalo * fe - haloRef.current.material.opacity) * 0.08;
    if (fadingOut && fe < 0.02) useStore.getState().setStage(0);
  });

  const handleClick = () => {
    if (activePortal === portalKey) {
      setExpandedPortal(portalKey);
    } else {
      setActivePortal(portalKey);
    }
  };

  const c = hovered ? hoverColor : color;
  const isPortraitY = isPortrait ? -1.8 : -2.2;

  return (
    <group ref={groupRef} position={[normPos.x, 0, normPos.z]}>
      <group ref={imageRef}>{interior}</group>
      <group ref={sphereRef}>
        <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onClick={handleClick}>
          <sphereGeometry args={[SPHERE_R, 64, 64]} />
          <MeshTransmissionMaterial background={new THREE.Color("#050505")} color={c} roughness={0.0} transmission={0.98} thickness={0.8} ior={1.3} samples={8} resolution={512} />
        </mesh>
        <mesh ref={rimRef}><sphereGeometry args={[SPHERE_R * 1.01, 64, 64]} /><meshBasicMaterial color="#ffffff" transparent opacity={0} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      </group>
      <group ref={followRef}>
        <BillboardContent>
          <mesh ref={haloRef} position={[0, 0, -0.2]}><planeGeometry args={[SPHERE_R * 6, SPHERE_R * 6]} /><meshBasicMaterial map={blueGlowTexture} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
          <PortalLabel text={title} sub={subtitle} color={color} offsetY={isPortraitY} />
        </BillboardContent>
      </group>
    </group>
  );
}

export default function DreamPortals() {
  return (
    <>
      <Portal color="#e0e8f8" hoverColor="#f0f4ff" title="寻剑 XR" subtitle="沉浸式东方幻想" interior={<PortalAInterior />} portalKey="portalA" />
      <Portal color="#e8d8a0" hoverColor="#f8f0d0" title="奇幻巴比伦" subtitle="下一代幻想社交世界" interior={<PortalBInterior />} portalKey="portalB" />
    </>
  );
}
