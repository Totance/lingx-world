import { useEffect, useRef } from "react";
import useStore from "../store";

export default function StageManager() {
  const timer = useRef(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null;
}
