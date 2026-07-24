import { Suspense, useEffect, useRef } from "react";
import Scene from "./components/Scene";
import Overlay from "./components/Overlay";
import AmbientEngine from "./audio/AmbientEngine";
import useStore from "./store";

const audioEngine = new AmbientEngine();

export default function App() {
  const started = useRef(false);

  useEffect(() => {
    const start = async () => {
      if (started.current) return;
      started.current = true;
      await audioEngine.init();
      audioEngine.start();
      useStore.getState().setAudioReady(true);
    };

    const onInteract = () => {
      start();
      document.removeEventListener("click", onInteract);
      document.removeEventListener("touchstart", onInteract);
      document.removeEventListener("keydown", onInteract);
    };

    document.addEventListener("click", onInteract);
    document.addEventListener("touchstart", onInteract);
    document.addEventListener("keydown", onInteract);

    return () => {
      document.removeEventListener("click", onInteract);
      document.removeEventListener("touchstart", onInteract);
      document.removeEventListener("keydown", onInteract);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <Overlay />
    </div>
  );
}
