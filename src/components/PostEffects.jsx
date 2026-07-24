import React from "react";
import { Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export default function PostEffects() {
  return (
    <>
      <Bloom
        intensity={0.35}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.85}
        mipmapBlur
      />
      <Vignette
        offset={0.5}
        darkness={0.28}
        blendFunction={BlendFunction.NORMAL}
      />
    </>
  );
}
