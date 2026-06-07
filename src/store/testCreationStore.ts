import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { QuestionItem, QuestionOption } from "@/features/questions/types";
import type { TestDraftMeta } from "@/features/tests/types";

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createBlankOptions(): QuestionOption[] {
  return ["A", "B", "C", "D"].map((label) => ({
    id: createId(`option-${label.toLowerCase()}`),
    text: "",
  }));
}

export function createBlankQuestion(
  overrides: Partial<QuestionItem> = {},
): QuestionItem {
  const options = overrides.options ?? createBlankOptions();

  return {
    id: createId("question"),
    questionText: "",
    questionHtml: "",
    type: "mcq",
    options,
    correctOptionId: options[0]?.id ?? "",
    solution: "",
    difficulty: "",
    topicId: "",
    topicName: "",
    subTopicId: "",
    subTopicName: "",
    ...overrides,
  };
}

type TestCreationStore = {
  testMeta: TestDraftMeta | null;
  questions: QuestionItem[];
  activeQuestionIndex: number;
  setTestMeta: (meta: TestDraftMeta) => void;
  initializeQuestions: (count: number) => void;
  addQuestion: () => void;
  setActiveQuestionIndex: (index: number) => void;
  updateQuestion: (index: number, patch: Partial<QuestionItem>) => void;
  updateQuestionOption: (
    questionIndex: number,
    optionIndex: number,
    text: string,
  ) => void;
  setCorrectOption: (questionIndex: number, optionId: string) => void;
  resetCurrentQuestion: () => void;
  importQuestions: (questions: QuestionItem[]) => void;
  clearDraft: () => void;
};

const initialState = {
  testMeta: null,
  questions: [createBlankQuestion()],
  activeQuestionIndex: 0,
};

/**
 * Zustand Store for Test Creation
 * 
 * DESIGN DECISION:
 * We use a centralized store with `persist` middleware to manage the entire test creation 
 * draft (metadata + questions array). This approach guarantees that if the user accidentally 
 * refreshes or navigates away during the multi-step wizard, they do not lose their drafted questions.
 */
export const useTestCreationStore = create<TestCreationStore>()(
  persist(
    (set) => ({
      ...initialState,
      setTestMeta: (meta) => set({ testMeta: meta }),
      initializeQuestions: (count) =>
        set((state) => {
          const safeCount = Math.max(1, count || 1);
          const questions =
            state.questions.length === safeCount
              ? state.questions
              : Array.from({ length: safeCount }, (_, index) =>
                  state.questions[index] ??
                  createBlankQuestion({
                    difficulty: state.testMeta?.difficulty ?? "Easy",
                    topicId: state.testMeta?.topicId ?? "",
                    topicName: state.testMeta?.topicName ?? "",
                    subTopicId: state.testMeta?.subTopicId ?? "",
                    subTopicName: state.testMeta?.subTopicName ?? "",
                  }),
                );

          return {
            questions,
            activeQuestionIndex: Math.min(state.activeQuestionIndex, questions.length - 1),
          };
        }),
      addQuestion: () =>
        set((state) => {
          const nextQuestion = createBlankQuestion({
            difficulty: state.testMeta?.difficulty ?? "Easy",
            topicId: state.testMeta?.topicId ?? "",
            topicName: state.testMeta?.topicName ?? "",
            subTopicId: state.testMeta?.subTopicId ?? "",
            subTopicName: state.testMeta?.subTopicName ?? "",
          });

          const nextQuestions = [...state.questions, nextQuestion];
          const nextMeta = state.testMeta
            ? {
                ...state.testMeta,
                questionCount: String(nextQuestions.length),
                totalMarks: String(
                  nextQuestions.length * (Number(state.testMeta.correctAnswer) || 0)
                ),
              }
            : null;

          return {
            questions: nextQuestions,
            testMeta: nextMeta,
            activeQuestionIndex: state.questions.length,
          };
        }),
      setActiveQuestionIndex: (index) =>
        set((state) => ({
          activeQuestionIndex: Math.min(
            Math.max(index, 0),
            Math.max(state.questions.length - 1, 0),
          ),
        })),
      updateQuestion: (index, patch) =>
        set((state) => ({
          questions: state.questions.map((question, itemIndex) =>
            itemIndex === index ? { ...question, ...patch } : question,
          ),
        })),
      updateQuestionOption: (questionIndex, optionIndex, text) =>
        set((state) => ({
          questions: state.questions.map((question, itemIndex) => {
            if (itemIndex !== questionIndex) {
              return question;
            }

            return {
              ...question,
              options: question.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? { ...option, text } : option,
              ),
            };
          }),
        })),
      setCorrectOption: (questionIndex, optionId) =>
        set((state) => ({
          questions: state.questions.map((question, itemIndex) =>
            itemIndex === questionIndex
              ? { ...question, correctOptionId: optionId }
              : question,
          ),
        })),
      resetCurrentQuestion: () =>
        set((state) => ({
          questions: state.questions.map((question, index) =>
            index === state.activeQuestionIndex
              ? createBlankQuestion({
                  id: question.id,
                  difficulty: state.testMeta?.difficulty ?? "Easy",
                  topicId: state.testMeta?.topicId ?? "",
                  topicName: state.testMeta?.topicName ?? "",
                  subTopicId: state.testMeta?.subTopicId ?? "",
                  subTopicName: state.testMeta?.subTopicName ?? "",
                })
              : question,
          ),
        })),
      importQuestions: (questions) =>
        set((state) => {
          const nextQuestions = questions.length ? questions : state.questions;
          const nextMeta = state.testMeta
            ? {
                ...state.testMeta,
                questionCount: String(nextQuestions.length),
                totalMarks: String(
                  nextQuestions.length * (Number(state.testMeta.correctAnswer) || 0)
                ),
              }
            : null;
          return {
            questions: nextQuestions,
            testMeta: nextMeta,
            activeQuestionIndex: 0,
          };
        }),
      clearDraft: () => set({ ...initialState, questions: [createBlankQuestion()] }),
    }),
    {
      name: "preproute-test-creation-draft",
    }
  )
);
