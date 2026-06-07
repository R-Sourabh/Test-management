import type { TestDifficulty, TestDraftMeta } from "@/features/tests/types";

export type QuestionOption = {
  id: string;
  text: string;
};

export type QuestionItem = {
  id: string;
  questionText: string;
  questionHtml: string;
  type: "mcq";
  options: QuestionOption[];
  correctOptionId: string;
  solution: string;
  difficulty: TestDifficulty;
  topicId?: string;
  topicName: string;
  subTopicId?: string;
  subTopicName: string;
};

export type PublishedQuestionPayload = {
  questionText: string;
  questionHtml: string;
  type: "mcq";
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  solution: string;
  difficulty: TestDifficulty;
  topicId?: string;
  subTopicId?: string;
};

export type BulkCreateQuestionsPayload = {
  testId?: string;
  questions: PublishedQuestionPayload[];
};

export type BulkQuestionFetchPayload = {
  questionIds: string[];
};

export type TestCreationDraft = {
  testMeta: TestDraftMeta | null;
  questions: QuestionItem[];
  activeQuestionIndex: number;
};
