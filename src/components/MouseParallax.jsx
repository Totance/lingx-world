import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import useStore from '../store';
import * as THREE from 'three';

export default function MouseParallax() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      useStore.getState().setMouse(x, y);
      target.current.set(x * 0.08, y * 0.08, 0);
    };
    const handleTouch = (e) => {
      if (e.touches.length > 0) {
        const x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        const y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        useStore.getState().setMouse(x, y);
        target.current.set(x * 0.08, y * 0.08, 0);
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleTouch);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  useFrame(() => {
    camera.position.x += (target.current.x - camera.position.x) * 0.03;
    camera.position.y += (target.current.y - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

