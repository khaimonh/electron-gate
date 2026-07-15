"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="protected-loading">
        <div className="loading-spinner" />
        <p>Verifying authentication...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="protected-denied">
        <div className="denied-icon">⛔</div>
        <h2>Access Denied</h2>
        <p>
          You don&apos;t have permission to access this page. Required role:{" "}
          <strong>{allowedRoles.join(", ")}</strong>
        </p>
        <button onClick={() => router.push("/dashboard")} className="btn-back">
          Go to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
