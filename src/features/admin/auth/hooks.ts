"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/http";
import * as api from "./api";
import { principalKey } from "./keys";

export { principalKey };

export function usePrincipal() {
  return useQuery({
    queryKey: principalKey,
    queryFn: api.getPrincipal,
    staleTime: 30_000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => api.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: principalKey });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.logout,
    onSettled: () => {
      queryClient.clear();
    },
  });
}

export function useMfaSetup() {
  return useMutation({ mutationFn: api.beginMfaSetup });
}

export function useMfaConfirm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.confirmMfa,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: principalKey }),
  });
}

export function useMfaChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.challengeMfa,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: principalKey }),
  });
}

export function useRecoveryLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.useRecoveryCode,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: principalKey }),
  });
}

export function useMfaDisable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.disableMfa,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: principalKey }),
  });
}

export function isMfaSetupRequired(error: unknown): boolean {
  return error instanceof ApiError && error.code === "mfa_setup_required";
}

export function isMfaRequired(error: unknown): boolean {
  return error instanceof ApiError && error.code === "mfa_required";
}
