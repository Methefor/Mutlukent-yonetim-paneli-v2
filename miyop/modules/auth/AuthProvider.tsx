"use client";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { ToastProvider } from "@/components/ui/use-toast";

export type UserRole =
  | "genel_mudur"
  | "koordinator"
  | "sube_muduru"
  | "muhasebe"
  | "ik"
  | "admin";

export type Profile = {
  id: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  sube_id: string | null;
};

type AuthContextValue = {
  user: { id: string; email: string | null } | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    setUser(user ? { id: user.id, email: user.email ?? null } : null);
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("id, user_id, name, avatar_url, role, sube_id")
        .eq("user_id", user.id)
        .single();
      setProfile((data as any) ?? null);
    } else {
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      sub.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    await load();
  };

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signOut,
    refresh: load
  };

  return (
    <ToastProvider>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </ToastProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
