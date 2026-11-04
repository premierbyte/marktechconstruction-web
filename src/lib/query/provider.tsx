"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ApiError } from "@/lib/http";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (count, error) => {
          if (error instanceof ApiError && error.status < 500) return false;
          return count < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export type QuerySeed = { queryKey: readonly unknown[]; data: unknown };

export function AdminQueryProvider({ children, seed }: { children: ReactNode; seed?: QuerySeed[] }) {
  const [client] = useState(() => {
    const instance = makeQueryClient();

    seed?.forEach(({ queryKey, data }) => {
      instance.setQueryData(queryKey, data);
    });

    return instance;
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
