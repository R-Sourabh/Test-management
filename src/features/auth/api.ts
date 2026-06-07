import { api } from "@/lib/axios";

import type { LoginPayload, LoginResponse } from "./types";

export function login(payload: LoginPayload) {
  return api.post<LoginResponse>("/auth/login", payload);
}
