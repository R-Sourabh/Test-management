import { api } from "@/lib/axios";

import type {
  TestPayload,
  TestSummary,
  TestDetails,
} from "@/features/tests/types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export function getTests() {
  return api.get<ApiResponse<TestSummary[]>>("/tests");
}

export function getTestById(id: string) {
  return api.get<ApiResponse<TestDetails>>(`/tests/${id}`);
}

export function createTest(payload: TestPayload) {
  return api.post<ApiResponse<TestDetails>>("/tests", payload);
}

export function updateTest(id: string, payload: Partial<TestPayload>) {
  return api.put<ApiResponse<TestDetails>>(`/tests/${id}`, payload);
}

