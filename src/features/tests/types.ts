export type TestSummary = {
  id: string;
  name: string;
  subject: string;
  topics: string[];
  status: string | null;
  created_at: string;
};

export type TestDetails = TestSummary & {
  questions: string[];
};

export type TestPayload = {
  name: string;
  type: string;
  subject: string;
  topics: string[];
  sub_topics: string[];
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: string;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: string | null;
};

export type TestDifficulty = "" | "Easy" | "Medium" | "Difficult";

export type TestDraftMeta = {
  mode: "Chapter Wise" | "PYQ" | "Mock Test";
  subjectId?: string;
  subjectName: string;
  topicId?: string;
  topicName: string;
  subTopicId?: string;
  subTopicName: string;
  testName: string;
  duration: string;
  difficulty: TestDifficulty;
  wrongAnswer: string;
  unattempted: string;
  correctAnswer: string;
  questionCount: string;
  totalMarks: string;
};
