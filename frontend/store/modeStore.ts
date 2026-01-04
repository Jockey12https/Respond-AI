import { create } from "zustand";

type ModeState = {
  mode: string;
  setMode: (m: string) => void;
};

export const useModeStore = create<ModeState>((set) => ({
  mode: "NORMAL",
  setMode: (mode: string) => set({ mode }),
}));
