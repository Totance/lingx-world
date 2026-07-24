import { useState, useEffect } from "react";
import * as THREE from "three";

function useImageTexture(url) {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = 512;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d");
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (size - w) / 2;
      const y = (size - h) / 2;
      ctx.drawImage(img, x, y, w, h);
      const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.44, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.9, "rgba(255,255,255,0.3)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const t = new THREE.CanvasTexture(c);
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.needsUpdate = true;
      setTex(t);
    };
    img.src = url;
  }, [url]);
  return tex;
}

function ImagePlane({ url }) {
  const tex = useImageTexture(url);
  if (!tex) return null;
  return (
    <mesh renderOrder={0}>
      <planeGeometry args={[2.0, 2.0]} />
      <meshBasicMaterial map={tex} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

export function PortalAInterior() {
  return <ImagePlane url="/assets/寻剑XR.png" />;
}

export function PortalBInterior() {
  return <ImagePlane url="/assets/奇幻巴比伦.jpg" />;
}
