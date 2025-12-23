import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationState {
  workLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  setWorkLocation: (
    location: { lat: number; lng: number; address: string } | null
  ) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      workLocation: null,
      setWorkLocation: (location) => set({ workLocation: location }),
    }),
    {
      name: "hikkoshilens-location",
    }
  )
);
