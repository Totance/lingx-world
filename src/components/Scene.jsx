import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import BreathingIcon from "./Logo";
import Particles from "./Particles";
import PostEffects from "./PostEffects";
import MouseParallax from "./MouseParallax";
import DreamPortals from "./DreamPortals";
import ConsciousnessLayer from "./ConsciousnessLayer";
import TeamScene from "./TeamScene";
import useStore from "../store";

function CameraAnimator() {
  const { camera } = useThree();
  const stage = useStore((s) => s.stage);
  const teamVisible = useStore((s) => s.teamVisible);
  const targetFov = teamVisible ? 60 : stage === 0 ? 50 : stage === 1 ? 90 : 65;
  const fovRef = useRef(camera.fov);
  useFrame(() => {
    fovRef.current += (targetFov - fovRef.current) * 0.02;
    camera.fov = fovRef.current;
    camera.updateProjectionMatrix();
  });
  return null;
}

function SceneContent() {
  const stage = useStore((s) => s.stage);
  const aboutUsVisible = useStore((s) => s.aboutUsVisible);
  const teamVisible = useStore((s) => s.teamVisible);
  const pageOpen = aboutUsVisible || teamVisible;

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", stage === 0 ? 5 : 10, stage === 0 ? 20 : 40]} />
      <ambientLight intensity={0.6} color="#fff8f0" />
      <pointLight position={[0, 0, 4]} intensity={3} color="#ffffff" />
      <pointLight position={[-2, -1, 5]} intensity={1} color="#fffaf0" />
      <pointLight position={[2, 1, 5]} intensity={0.8} color="#fffaf0" />
      <CameraAnimator />
      <MouseParallax />
      {!pageOpen && (stage === 0 || stage === 1) && <BreathingIcon />}
      {!pageOpen && (stage === 2 || stage === 3) && <><DreamPortals /><ConsciousnessLayer /></>}
      {teamVisible && <TeamScene />}
      <Particles count={100} />
      <PostEffects />
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "#050505" }}
      frameloop="always"
    >
      <SceneContent />
    </Canvas>
  );
}
