import { create } from "zustand";

import type { QuestionItem } from "@/features/questions/types";

type QuestionStore = {
  questions: QuestionItem[];
  addQuestion: (question: QuestionItem) => void;
  updateQuestion: (index: number, question: Partial<QuestionItem>) => void;
  removeQuestion: (index: number) => void;
  clearQuestions: () => void;
};

export const useQuestionStore = create<QuestionStore>((set) => ({
  questions: [],
  addQuestion: (question) =>
    set((state) => ({
      questions: [...state.questions, question],
    })),
  updateQuestion: (index, question) =>
    set((state) => ({
      questions: state.questions.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...question } : item,
      ),
    })),
  removeQuestion: (index) =>
    set((state) => ({
      questions: state.questions.filter((_, itemIndex) => itemIndex !== index),
    })),
  clearQuestions: () => set({ questions: [] }),
}));
