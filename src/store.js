import { create } from 'zustand';

const useStore = create((set) => ({
  stage: 0,
  mouse: { x: 0, y: 0 },
  audioReady: false,
  loaded: false,
  activePortal: null,
  portalScreenPos: { x: 0, y: 0 },
  aboutUsVisible: false,
  teamVisible: false,
  expandedPortal: null,

  setStage: (stage) => set({ stage }),
  setMouse: (x, y) => set({ mouse: { x, y } }),
  setAudioReady: (ready) => set({ audioReady: ready }),
  setLoaded: (loaded) => set({ loaded }),
  setActivePortal: (portal) => set({ activePortal: portal, expandedPortal: null }),
  setPortalScreenPos: (pos) => set({ portalScreenPos: pos }),
  setAboutUsVisible: (v) => set({ aboutUsVisible: v }),
  setTeamVisible: (v) => set({ teamVisible: v }),
  setExpandedPortal: (portal) => set({ expandedPortal: portal }),
}));

export default useStore;
