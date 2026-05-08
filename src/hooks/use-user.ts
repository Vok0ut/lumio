"use client";

import { createContext } from "react";
import { useSession } from "next-auth/react";

interface UserContextValue {
  user: { id: string; email: string; name?: string | null } | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export function useUser(): UserContextValue {
  const { data: session, status } = useSession();

  return {
    user: session?.user
      ? {
          id: session.user.id as string,
          email: session.user.email!,
          name: session.user.name,
        }
      : null,
    loading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}

export { UserContext };
