import React, { Suspense, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import Scene from "./components/Scene";
import Overlay from "./components/Overlay";
import AmbientEngine from "./audio/AmbientEngine";
import useStore from "./store";
import CursorDust from "./components/CursorDust";
import "./index.css";

const audioEngine = new AmbientEngine();

function App() {
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
      <CursorDust />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <Overlay />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);


