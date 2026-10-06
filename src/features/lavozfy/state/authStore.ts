import { create } from "zustand";
import { lvjAuth } from "@/services/lvjAuth";
import type { Session, User } from "@supabase/supabase-js";

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  init: () => void;
  signOut: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  init: () => {
    lvjAuth.auth.onAuthStateChange((_e, session) => {
      set({ session, user: session?.user ?? null, loading: false });
    });
    lvjAuth.auth.getSession().then(({ data }) => {
      set({ session: data.session, user: data.session?.user ?? null, loading: false });
    });
  },
  signOut: async () => { await lvjAuth.auth.signOut(); },
}));