import { api } from "@/lib/axios";

import type {
  BulkCreateQuestionsPayload,
  BulkQuestionFetchPayload,
  QuestionItem,
} from "./types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export function bulkCreateQuestions(payload: BulkCreateQuestionsPayload) {
  return api.post<ApiResponse<QuestionItem[]>>("/questions/bulk", payload);
}

export function fetchBulkQuestions(payload: BulkQuestionFetchPayload) {
  return api.post<ApiResponse<QuestionItem[]>>("/questions/bulk-fetch", payload);
}
