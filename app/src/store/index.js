import { create } from "zustand";
import { persist } from "zustand/middleware";

const store = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set(() => ({ user })),
    }),
    {
      name: "info-store",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
export default store;
