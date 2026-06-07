import { api } from "@/lib/axios";
import type { AxiosResponse } from "axios";

import type {
  Subject,
  Topic,
  SubTopic,
  MultiTopicPayload,
  ApiResponse,
} from "./types";

// In-memory global promise caches
let subjectsCache: Promise<AxiosResponse<ApiResponse<Subject[]>>> | null = null;
let topicsCache: Promise<AxiosResponse<ApiResponse<Topic[]>>> | null = null;
let subTopicsCache: Promise<AxiosResponse<ApiResponse<SubTopic[]>>> | null = null;

const topicsBySubjectCache: Record<string, Promise<AxiosResponse<ApiResponse<Topic[]>>>> = {};
const subTopicsByTopicCache: Record<string, Promise<AxiosResponse<ApiResponse<SubTopic[]>>>> = {};

export function getSubjects() {
  if (!subjectsCache) {
    subjectsCache = api.get<ApiResponse<Subject[]>>("/subjects");
  }
  return subjectsCache;
}

export function getTopics() {
  if (!topicsCache) {
    topicsCache = api.get<ApiResponse<Topic[]>>("/topics");
  }
  return topicsCache;
}

export function getSubTopics() {
  if (!subTopicsCache) {
    subTopicsCache = api.get<ApiResponse<SubTopic[]>>("/sub-topics");
  }
  return subTopicsCache;
}

export function getTopicsBySubject(subjectId: string) {
  if (!topicsBySubjectCache[subjectId]) {
    topicsBySubjectCache[subjectId] = api.get<ApiResponse<Topic[]>>(`/topics/subject/${subjectId}`);
  }
  return topicsBySubjectCache[subjectId];
}

export function getSubTopicsByTopic(topicId: string) {
  if (!subTopicsByTopicCache[topicId]) {
    subTopicsByTopicCache[topicId] = api.get<ApiResponse<SubTopic[]>>(`/sub-topics/topic/${topicId}`);
  }
  return subTopicsByTopicCache[topicId];
}

export function getSubTopicsByMultiTopics(payload: MultiTopicPayload) {
  return api.post<ApiResponse<SubTopic[]>>("/sub-topics/by-topics", payload);
}

