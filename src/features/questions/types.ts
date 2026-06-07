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
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string;
  explanation: string;
  difficulty: string;
  subject: string;
  test_id: string;
  topic: string;
  sub_topic: string;
  type: "mcq";
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
