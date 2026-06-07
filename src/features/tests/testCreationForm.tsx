import { ChevronDownIcon as ChevronDown, XMarkIcon as X } from "@heroicons/react/24/outline";
import { type ReactNode, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { getSubjects, getTopicsBySubject, getSubTopicsByTopic } from "@/features/taxonomy/api";

import type { TestDraftMeta, TestDifficulty } from "./types";

export const modeOptions = ["Chapter Wise", "PYQ", "Mock Test"] as const;
export const difficultyOptions = ["Easy", "Medium", "Difficult"] as const;

export type TestFormState = {
  mode: (typeof modeOptions)[number];
  subject: string;
  topic: string;
  subTopic: string;
  testName: string;
  duration: string;
  difficulty: TestDifficulty;
  wrongAnswer: string;
  unattempted: string;
  correctAnswer: string;
  questionCount: string;
  subjectName?: string;
  topicName?: string;
  subTopicName?: string;
};

export const initialTestFormState: TestFormState = {
  mode: "Chapter Wise",
  subject: "",
  topic: "",
  subTopic: "",
  testName: "",
  duration: "",
  difficulty: "",
  wrongAnswer: "-1",
  unattempted: "+0",
  correctAnswer: "+5",
  questionCount: "",
  subjectName: "",
  topicName: "",
  subTopicName: "",
};

export function getTestFormState(draftMeta: TestDraftMeta | null): TestFormState {
  if (!draftMeta) {
    return initialTestFormState;
  }

  return {
    mode: draftMeta.mode,
    subject: draftMeta.subjectId || "",
    topic: draftMeta.topicId || "",
    subTopic: draftMeta.subTopicId || "",
    testName: draftMeta.testName,
    duration: draftMeta.duration,
    difficulty: draftMeta.difficulty,
    wrongAnswer: draftMeta.wrongAnswer,
    unattempted: draftMeta.unattempted,
    correctAnswer: draftMeta.correctAnswer,
    questionCount: draftMeta.questionCount,
    subjectName: draftMeta.subjectName,
    topicName: draftMeta.topicName,
    subTopicName: draftMeta.subTopicName,
  };
}

export function getTotalMarks(form: TestFormState) {
  const positiveMark = Number(form.correctAnswer.replace("+", ""));
  const questions = Number(form.questionCount);

  if (!positiveMark || !questions) {
    return "";
  }

  return String(positiveMark * questions);
}

export function updateTestFormField<K extends keyof TestFormState>(
  current: TestFormState,
  key: K,
  value: TestFormState[K],
): TestFormState {
  if (key === "subject") {
    return {
      ...current,
      subject: value as string,
      subjectName: "",
      topic: "",
      topicName: "",
      subTopic: "",
      subTopicName: "",
    };
  }

  if (key === "topic") {
    return {
      ...current,
      topic: value as string,
      topicName: "",
      subTopic: "",
      subTopicName: "",
    };
  }

  return {
    ...current,
    [key]: value,
  };
}

export function buildTestDraftMeta(
  form: TestFormState,
  previousMeta: TestDraftMeta | null,
): TestDraftMeta {
  return {
    mode: form.mode,
    subjectId: form.subject || previousMeta?.subjectId,
    subjectName: form.subjectName || form.subject || previousMeta?.subjectName || "",
    topicId: form.topic || previousMeta?.topicId,
    topicName: form.topicName || form.topic || previousMeta?.topicName || "",
    subTopicId: form.subTopic || previousMeta?.subTopicId,
    subTopicName: form.subTopicName || form.subTopic || previousMeta?.subTopicName || "",
    testName: form.testName,
    duration: form.duration,
    difficulty: form.difficulty,
    wrongAnswer: form.wrongAnswer,
    unattempted: form.unattempted,
    correctAnswer: form.correctAnswer,
    questionCount: form.questionCount,
    totalMarks: getTotalMarks(form),
  };
}

export function TestCreationFormFields({
  form,
  onChange,
}: {
  form: TestFormState;
  onChange: <K extends keyof TestFormState>(key: K, value: TestFormState[K]) => void;
}) {
  const totalMarks = getTotalMarks(form);

  const [subjectsList, setSubjectsList] = useState<Array<{ value: string; label: string }>>([]);
  const [topicsList, setTopicsList] = useState<Array<{ value: string; label: string }>>([]);
  const [subTopicsList, setSubTopicsList] = useState<Array<{ value: string; label: string }>>([]);

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubTopics, setLoadingSubTopics] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoadingSubjects(true);
      try {
        const res = await getSubjects();
        if (ignore) return;
        const list = (res.data.data || []).map((s) => ({ value: s.id, label: s.name }));
        setSubjectsList(list);

        if (!form.subject && form.subjectName) {
          const match = list.find((s) => s.label.toLowerCase() === form.subjectName?.toLowerCase());
          if (match) {
            onChange("subject", match.value);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoadingSubjects(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [form.subject, form.subjectName]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!form.subject) {
        setTopicsList([]);
        return;
      }
      setLoadingTopics(true);
      try {
        const res = await getTopicsBySubject(form.subject);
        if (ignore) return;
        const list = (res.data.data || []).map((t) => ({ value: t.id, label: t.name }));
        setTopicsList(list);

        if (!form.topic && form.topicName) {
          const match = list.find((t) => t.label.toLowerCase() === form.topicName?.toLowerCase());
          if (match) {
            onChange("topic", match.value);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoadingTopics(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [form.subject, form.topic, form.topicName]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!form.topic) {
        setSubTopicsList([]);
        return;
      }
      setLoadingSubTopics(true);
      try {
        const res = await getSubTopicsByTopic(form.topic);
        if (ignore) return;
        const list = (res.data.data || []).map((st) => ({ value: st.id, label: st.name }));
        setSubTopicsList(list);

        if (!form.subTopic && form.subTopicName) {
          const match = list.find((st) => st.label.toLowerCase() === form.subTopicName?.toLowerCase());
          if (match) {
            onChange("subTopic", match.value);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoadingSubTopics(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [form.topic, form.subTopic, form.subTopicName]);

  return (
    <>
      <div className="mb-7 inline-flex rounded-xl border border-[#E6EBF2] bg-white p-1">
        {modeOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange("mode", option)}
            className={[
              "rounded-lg px-4 py-2 text-[14px] font-medium transition-colors",
              form.mode === option
                ? "bg-[#F3F6FF] text-[#384EC7]"
                : "text-[#A0AABC]",
            ].join(" ")}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
        <Field label="Subject">
          <SelectField
            value={form.subject}
            onChange={(value) => {
              const selectedObj = subjectsList.find((s) => s.value === value);
              onChange("subject", value);
              onChange("subjectName", selectedObj ? selectedObj.label : "");
              onChange("topic", "");
              onChange("topicName", "");
              onChange("subTopic", "");
              onChange("subTopicName", "");
            }}
            placeholder={loadingSubjects ? "Loading..." : "Choose from Drop-down"}
            options={subjectsList}
            disabled={loadingSubjects}
          />
        </Field>

        <Field label="Name of Test">
          <TextField
            value={form.testName}
            onChange={(value) => onChange("testName", value)}
            placeholder="Enter name of Test"
          />
        </Field>

        <Field label="Topic">
          <SelectField
            value={form.topic}
            onChange={(value) => {
              const selectedObj = topicsList.find((t) => t.value === value);
              onChange("topic", value);
              onChange("topicName", selectedObj ? selectedObj.label : "");
              onChange("subTopic", "");
              onChange("subTopicName", "");
            }}
            placeholder={
              !form.subject 
                ? "Choose Subject first" 
                : (loadingTopics ? "Loading..." : "Choose from Drop-down")
            }
            options={topicsList}
            disabled={loadingTopics || !form.subject}
          />
        </Field>

        <Field label="Sub Topic">
          <SelectField
            value={form.subTopic}
            onChange={(value) => {
              const selectedObj = subTopicsList.find((st) => st.value === value);
              onChange("subTopic", value);
              onChange("subTopicName", selectedObj ? selectedObj.label : "");
            }}
            placeholder={
              !form.topic 
                ? "Choose Topic first" 
                : (loadingSubTopics ? "Loading..." : "Choose from Drop-down")
            }
            options={subTopicsList}
            disabled={loadingSubTopics || !form.topic}
          />
        </Field>

        <Field label="Duration (Minutes)">
          <TextField
            value={form.duration}
            onChange={(value) => onChange("duration", value)}
            placeholder="Enter the time"
            type="number"
          />
        </Field>

        <Field label="Test Difficulty Level">
          <div className="flex h-[46px] items-center justify-between gap-4 rounded-xl">
            {difficultyOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-[14px] text-[#3A4658]"
              >
                <input
                  type="radio"
                  name="difficulty"
                  checked={form.difficulty === option}
                  onChange={() => onChange("difficulty", option)}
                  className="size-4 accent-[#6482F3]"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-6">
        <h2 className="mb-6 text-[14px] font-medium text-[#3A4658]">
          Marking Scheme:
        </h2>

        <div className="grid gap-x-10 gap-y-6 md:grid-cols-5">
          <Field label="Wrong Answer">
            <NumberField
              value={form.wrongAnswer}
              onChange={(value) => onChange("wrongAnswer", value)}
            />
          </Field>

          <Field label="Unattempted">
            <NumberField
              value={form.unattempted}
              onChange={(value) => onChange("unattempted", value)}
            />
          </Field>

          <Field label="Correct Answer">
            <NumberField
              value={form.correctAnswer}
              onChange={(value) => onChange("correctAnswer", value)}
            />
          </Field>

          <Field label="No of Questions">
            <TextField
              value={form.questionCount}
              onChange={(value) => onChange("questionCount", value)}
              placeholder="Ex:20 Questions"
              type="number"
            />
          </Field>

          <Field label="Total Marks" muted>
            <input
              value={totalMarks ? `Ex:${totalMarks} Marks` : ""}
              readOnly
              placeholder="Ex:250 Marks"
              className="h-[40px] w-full rounded-[10px] border border-[#D9E1EC] bg-[#FBFCFE] px-4 text-[14px] text-[#A7B1BF] outline-none"
            />
          </Field>
        </div>
      </div>
    </>
  );
}

export function EditTestCreationModal({
  open,
  form,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;
  form: TestFormState;
  onChange: <K extends keyof TestFormState>(key: K, value: TestFormState[K]) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F1F1F]/75 px-4 py-6">
      <div className="w-full max-w-[1200px] overflow-hidden rounded-[10px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between border-b border-[#D9E7FF] px-6 py-5">
          <h2 className="text-[14px] font-medium text-[#4F5C6F]">
            Edit Test creation
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#4F5C6F] transition-colors hover:text-[#263247]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <TestCreationFormFields form={form} onChange={onChange} />

          <div className="mt-10 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-[40px] min-w-[128px] rounded-[8px] border-0 bg-[#F6F8FC] text-[14px] font-medium text-[#315EF6] hover:bg-[#EDF2FB]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSave}
              className="h-[40px] min-w-[123px] rounded-[8px] border-0 bg-[#6B7FF2] text-[14px] font-medium text-white hover:bg-[#5D72EA]"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  muted = false,
}: {
  label: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="space-y-3">
      <label
        className={[
          "block text-[14px] font-medium",
          muted ? "text-[#C0C7D4]" : "text-[#3A4658]",
        ].join(" ")}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-[40px] w-full rounded-[8px] border border-[#D9E1EC] bg-white px-4 text-[14px] text-[#3A4658] outline-none placeholder:text-[#C4CCD8] focus:border-[#B8C8F4]"
    />
  );
}

function SelectField({
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<string | { value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={[
          "h-[40px] w-full appearance-none rounded-[8px] border border-[#D9E1EC] bg-white px-4 pr-10 text-[14px] outline-none focus:border-[#B8C8F4]",
          disabled ? "cursor-not-allowed bg-gray-50 text-[#C4CCD8]" : (value ? "text-[#3A4658]" : "text-[#C4CCD8]"),
        ].join(" ")}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const val = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return (
            <option key={val} value={val}>
              {label}
            </option>
          );
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#7F8A9B]" />
    </div>
  );
}

function NumberField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-[40px] w-full rounded-[8px] border border-[#D9E1EC] bg-white px-4 text-[14px] text-[#3A4658] outline-none focus:border-[#B8C8F4]"
    />
  );
}

