"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "./AuthProvider";

export function RequireRole({ allow, children }: { allow: UserRole[]; children: ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile && !allow.includes(profile.role)) {
      router.replace("/dashboard");
    }
  }, [loading, profile, allow, router]);

  if (loading) return null;
  if (!profile || !allow.includes(profile.role)) return null;
  return <>{children}</>;
}
