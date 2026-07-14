"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function ClientSessionCheck() {
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.session) {
          window.location.replace("/login");
        }
      } catch (error) {
        console.error("Session check failed", error);
      }
    };

    // Check on mount
    checkSession();

    // Check on bfcache restore
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        checkSession();
      }
    };
    
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}
