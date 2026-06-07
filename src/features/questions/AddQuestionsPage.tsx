import type { ComponentType } from "react";
import {
  Bars3Icon as AlignCenter,
  Bars3BottomLeftIcon as AlignLeft,
  Bars3BottomRightIcon as AlignRight,
  ChevronDownIcon as ChevronDown,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  ListBulletIcon as List,
  CalculatorIcon,
  PlusIcon as Plus,
  TrashIcon as Trash2,
  ArrowUpTrayIcon as Upload,
  LinkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { type ChangeEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  buildTestDraftMeta,
  EditTestCreationModal,
  getTestFormState,
  type TestFormState,
  updateTestFormField,
} from "@/features/tests/testCreationForm";
import { getSubjects, getTopicsBySubject, getSubTopicsByTopic } from "@/features/taxonomy/api";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { createBlankQuestion, useTestCreationStore } from "@/store/testCreationStore";
import { TestSummaryHeader } from "@/features/tests/TestSummaryHeader";

import type { QuestionItem } from "./types";
import type { TestDraftMeta } from "@/features/tests/types";


export function AddQuestionsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [topics, setTopics] = useState<Array<{ id: string; name: string }>>([]);
  const [subTopics, setSubTopics] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubTopics, setLoadingSubTopics] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const draftMeta = useTestCreationStore((state) => state.testMeta);
  const questions = useTestCreationStore((state) => state.questions);
  const activeQuestionIndex = useTestCreationStore(
    (state) => state.activeQuestionIndex,
  );
  const addQuestion = useTestCreationStore((state) => state.addQuestion);
  const importQuestions = useTestCreationStore((state) => state.importQuestions);
  const clearDraft = useTestCreationStore((state) => state.clearDraft);
  const resetCurrentQuestion = useTestCreationStore(
    (state) => state.resetCurrentQuestion,
  );
  const setActiveQuestionIndex = useTestCreationStore(
    (state) => state.setActiveQuestionIndex,
  );
  const updateQuestion = useTestCreationStore((state) => state.updateQuestion);
  const updateQuestionOption = useTestCreationStore(
    (state) => state.updateQuestionOption,
  );
  const setCorrectOption = useTestCreationStore((state) => state.setCorrectOption);
  const setTestMeta = useTestCreationStore((state) => state.setTestMeta);
  const initializeQuestions = useTestCreationStore(
    (state) => state.initializeQuestions,
  );
  const [editForm, setEditForm] = useState<TestFormState>(() =>
    getTestFormState(draftMeta),
  );

  const currentQuestion =
    questions[activeQuestionIndex] ?? createBlankQuestion({
      difficulty: draftMeta?.difficulty ?? "",
      topicName: draftMeta?.topicName ?? "",
      subTopicName: draftMeta?.subTopicName ?? "",
    });

  const totalQuestions = Math.max(
    Number(draftMeta?.questionCount) || 0,
    questions.length,
    1,
  );

  const selectedSubjectId = useMemo(() => {
    if (!draftMeta?.subjectName) {
      return "";
    }

    return draftMeta.subjectId ?? "";
  }, [draftMeta]);

  useEffect(() => {
    setEditForm(getTestFormState(draftMeta));
  }, [draftMeta]);

  useEffect(() => {
    let ignore = false;

    async function loadSubjects() {
      if (!draftMeta?.subjectName) {
        return;
      }

      try {
        const response = await getSubjects();

        if (ignore) {
          return;
        }

        const matchingSubject = response.data.data.find(
          (subject) => subject.name.toLowerCase() === draftMeta.subjectName.toLowerCase(),
        );

        if (matchingSubject && !draftMeta.subjectId) {
          setTestMeta({
            ...draftMeta,
            subjectId: matchingSubject.id,
          });
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadSubjects();

    return () => {
      ignore = true;
    };
  }, [draftMeta, setTestMeta]);

  useEffect(() => {
    let ignore = false;

    async function loadTopics() {
      const subjectId = draftMeta?.subjectId ?? selectedSubjectId;

      if (!subjectId) {
        setTopics([]);
        return;
      }

      setLoadingTopics(true);
      try {
        const response = await getTopicsBySubject(subjectId);

        if (ignore) {
          return;
        }

        const filteredTopics = response.data.data || [];

        setTopics(filteredTopics);

        if (currentQuestion.topicName && !currentQuestion.topicId) {
          const matchingTopic = filteredTopics.find(
            (topic) => topic.name === currentQuestion.topicName,
          );

          if (matchingTopic) {
            updateQuestion(activeQuestionIndex, {
              topicId: matchingTopic.id,
            });
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) {
          setLoadingTopics(false);
        }
      }
    }

    loadTopics();

    return () => {
      ignore = true;
    };
  }, [
    activeQuestionIndex,
    currentQuestion.topicId,
    currentQuestion.topicName,
    draftMeta,
    selectedSubjectId,
    updateQuestion,
  ]);

  useEffect(() => {
    let ignore = false;

    async function loadSubTopics() {
      if (!currentQuestion.topicId) {
        setSubTopics([]);
        return;
      }

      setLoadingSubTopics(true);
      try {
        const response = await getSubTopicsByTopic(currentQuestion.topicId);

        if (ignore) {
          return;
        }

        const filteredSubTopics = response.data.data || [];

        setSubTopics(filteredSubTopics);

        if (currentQuestion.subTopicName && !currentQuestion.subTopicId) {
          const matchingSubTopic = filteredSubTopics.find(
            (subTopic) => subTopic.name === currentQuestion.subTopicName,
          );

          if (matchingSubTopic) {
            updateQuestion(activeQuestionIndex, {
              subTopicId: matchingSubTopic.id,
            });
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) {
          setLoadingSubTopics(false);
        }
      }
    }

    loadSubTopics();

    return () => {
      ignore = true;
    };
  }, [
    activeQuestionIndex,
    currentQuestion.subTopicId,
    currentQuestion.subTopicName,
    currentQuestion.topicId,
    updateQuestion,
  ]);


  function handleQuestionTextChange(value: string) {
    updateQuestion(activeQuestionIndex, {
      questionHtml: value,
      questionText: htmlToPlainText(value),
    });
  }

  function handleTopicChange(topicId: string) {
    const selectedTopic = topics.find((topic) => topic.id === topicId);

    updateQuestion(activeQuestionIndex, {
      topicId,
      topicName: selectedTopic?.name ?? "",
      subTopicId: "",
      subTopicName: "",
    });
  }

  function handleSubTopicChange(subTopicId: string) {
    const selectedSubTopic = subTopics.find((subTopic) => subTopic.id === subTopicId);

    updateQuestion(activeQuestionIndex, {
      subTopicId,
      subTopicName: selectedSubTopic?.name ?? "",
    });
  }

  function handleCsvButtonClick() {
    fileInputRef.current?.click();
  }

  function handleOpenEditModal() {
    setEditForm(getTestFormState(draftMeta));
    setIsEditModalOpen(true);
  }

  function handleEditField<K extends keyof TestFormState>(
    key: K,
    value: TestFormState[K],
  ) {
    setEditForm((current) => updateTestFormField(current, key, value));
  }

  function handleSaveEditModal() {
    const nextMeta = buildTestDraftMeta(editForm, draftMeta);

    setTestMeta(nextMeta);
    initializeQuestions(Number(editForm.questionCount) || 1);
    setIsEditModalOpen(false);
  }

  /**
   * Handles importing a CSV file containing questions.
   * We expect a basic CSV structure where each row maps to a question.
   * If parsing fails, it alerts the user and clears the input.
   */
  async function handleCsvImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const importedQuestions = parseCsvQuestions(text, draftMeta);

      if (!importedQuestions.length) {
        alert("CSV did not contain any supported question rows.");
        return;
      }

      importQuestions(importedQuestions);
      alert(`${importedQuestions.length} questions imported from CSV.`);
    } catch (error) {
      console.error(error);
      alert("CSV import failed. Use the documented simple column format.");
    } finally {
      event.target.value = "";
    }
  }

  function handleExit() {
    clearDraft();
    navigate(ROUTES.testsCreate);
  }

  /**
   * Routes the user to the Preview & Publish configuration screen.
   * In a real app, this might also autosave the draft state to the backend.
   */
  function handleGoToPublish() {
    navigate(ROUTES.testsPreview.replace(":id", id ?? "draft-test"));
  }

  /**
   * Advances the wizard to the next question.
   */
  function handleNextQuestion() {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    }
  }

  return (
    <div className="-mx-4 -mt-5 min-h-[calc(100vh-100px)] bg-white sm:-mx-6">
      <div className="flex items-center justify-between border-b border-surface-base px-4 py-4 sm:px-6">
        <div className="text-sm text-content-subtle">
          Test Creation <span className="mx-2 text-content-lighter">/</span> Create Test{" "}
          <span className="mx-2 text-content-lighter">/</span>
          <span className="text-content-muted">{draftMeta?.mode ?? "Chapter Wise"}</span>
        </div>

        <Button
          type="button"
          onClick={handleGoToPublish}
          className="h-[38px] min-w-[150px] rounded-[8px] border-0 bg-brand text-sm font-medium text-white hover:bg-brand-hover"
        >
          Publish
        </Button>
      </div>

      <div className="min-h-[calc(100vh-165px)]">
        <section className="px-4 py-4 sm:px-6">

          <TestSummaryHeader onEditClick={handleOpenEditModal} className="rounded-lg border border-surface-card bg-white px-4 py-4" />

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-content-main">
              Question {activeQuestionIndex + 1}
              <span className="ml-1 text-[#8BA1F9]">/{totalQuestions}</span>
            </h2>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="h-[36px] rounded-[8px] border border-surface-card bg-white px-4 text-[13px] font-medium text-[#7A8799]"
              >
                <Plus className="mr-2 size-4" />
                MCQ
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCsvButtonClick}
                className="h-[36px] rounded-[8px] border border-surface-card bg-white px-4 text-[13px] font-medium text-[#7A8799]"
              >
                <Upload className="mr-2 size-4" />
                CSV
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvImport}
                className="hidden"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={resetCurrentQuestion}
            className="mt-6 flex items-center gap-2 bg-[#FFFBFB] text-sm text-status-danger-hover"
          >
            <Trash2 className="size-4" />
            Delete All Edits
          </button>

          <div className="mt-6">
            <RichTextEditor
              key={currentQuestion.id}
              value={currentQuestion.questionHtml}
              onChange={handleQuestionTextChange}
            />
          </div>

          <div className="mt-7">
            <h3 className="mb-4 text-base font-medium text-content-main">
              Type the options below
            </h3>

            <div className="space-y-4">
              {currentQuestion.options.map((option, optionIndex) => (
                <div key={option.id} className="flex items-center gap-4">
                  <input
                    type="radio"
                    checked={currentQuestion.correctOptionId === option.id}
                    onChange={() => setCorrectOption(activeQuestionIndex, option.id)}
                    className="size-[24px] accent-brand"
                  />
                  <div className="relative flex-1">
                    <input
                      value={option.text}
                      onChange={(event) =>
                        updateQuestionOption(
                          activeQuestionIndex,
                          optionIndex,
                          event.target.value,
                        )
                      }
                      placeholder="Type Option here"
                      className="h-[48px] w-full rounded-[10px] border border-surface-input bg-white px-4 pr-10 text-sm text-content-body outline-none placeholder:text-[#9CA3AF] focus:border-[#B8C8F4]"
                    />
                    <Trash2 className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#D1D5DB]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <h3 className="mb-4 text-base font-medium text-content-main">
              Add Solution
            </h3>
            <div className="relative">
              <Textarea
                value={currentQuestion.solution}
                onChange={(event) =>
                  updateQuestion(activeQuestionIndex, {
                    solution: event.target.value,
                  })
                }
                placeholder="Type here"
                className="min-h-[132px] rounded-[10px] border-surface-input px-4 py-4 text-sm text-content-body placeholder:text-[#C1C9D6] focus-visible:border-[#B8C8F4] focus-visible:ring-0"
              />
              <Trash2 className="pointer-events-none absolute right-4 top-4 size-4 text-[#D1D5DB]" />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-28 text-content-lightest">
            <button
              type="button"
              disabled={activeQuestionIndex === 0}
              onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              disabled={activeQuestionIndex >= questions.length - 1}
              onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="mt-10 w-full">
            <h3 className="mb-6 text-base text-[#374151]">
              Question settings
            </h3>

            <div className="space-y-5">
              <SettingField label="Level of Difficulty">
                <select
                  value={currentQuestion.difficulty}
                  onChange={(event) =>
                    updateQuestion(activeQuestionIndex, {
                      difficulty: event.target.value as QuestionItem["difficulty"],
                    })
                  }
                  className="h-[42px] w-full appearance-none rounded-[10px] border border-surface-input bg-white px-4 pr-10 text-base text-[#D1D5DB] outline-none"
                >
                  <option value="">Select from Drop-down</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Difficult">Difficult</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#7F8A9B]" />
              </SettingField>

              <SettingField label="Topic">
                <select
                  value={currentQuestion.topicId ?? ""}
                  onChange={(event) => handleTopicChange(event.target.value)}
                  disabled={loadingTopics || !selectedSubjectId}
                  className="h-[42px] w-full appearance-none rounded-[10px] border border-surface-input bg-white px-4 pr-10 text-base text-[#3A4658] outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-[#C4CCD8]"
                >
                  <option value="">
                    {!selectedSubjectId 
                      ? "Choose Subject first" 
                      : (loadingTopics ? "Loading..." : "Select from Drop-down")}
                  </option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id} className="text-[#3A4658]">
                      {topic.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#6B7180]" />
              </SettingField>

              <SettingField label="Sub-topic">
                <select
                  value={currentQuestion.subTopicId ?? ""}
                  onChange={(event) => handleSubTopicChange(event.target.value)}
                  disabled={loadingSubTopics || !currentQuestion.topicId}
                  className="h-[42px] w-full appearance-none rounded-[10px] border border-surface-input bg-white px-4 pr-10 text-base text-[#3A4658] outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-[#C4CCD8]"
                >
                  <option value="">
                    {!currentQuestion.topicId 
                      ? "Choose Topic first" 
                      : (loadingSubTopics ? "Loading..." : "Select from Drop-down")}
                  </option>
                  {subTopics.map((subTopic) => (
                    <option key={subTopic.id} value={subTopic.id} className="text-[#3A4658]">
                      {subTopic.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#7F8A9B]" />
              </SettingField>
            </div>

            <div className="mt-9 flex items-center justify-between">
              <Button
                type="button"
                onClick={handleExit}
                className="h-[40px] rounded-[8px] border-0 bg-status-danger-hover px-5 text-sm font-medium text-white hover:bg-status-danger-hover"
              >
                Exit Test Creation
              </Button>

              <Button
                type="button"
                onClick={handleNextQuestion}
                disabled={activeQuestionIndex >= questions.length - 1}
                className="h-[40px] min-w-[129px] rounded-[8px] border-0 bg-brand text-sm font-medium text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      </div>

      <EditTestCreationModal
        open={isEditModalOpen}
        form={editForm}
        onChange={handleEditField}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEditModal}
      />
    </div>
  );
}



function SettingField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-content-body">
        {label}
      </label>
      <div className="relative">{children}</div>
    </div>
  );
}

const IconItalic = ({ className }: { className?: string }) => <span className={cn("flex items-center justify-center font-serif italic font-semibold text-[17px] leading-none", className)}>I</span>;
const IconBold = ({ className }: { className?: string }) => <span className={cn("flex items-center justify-center font-serif font-bold text-[16px] leading-none", className)}>B</span>;
const IconUnderline = ({ className }: { className?: string }) => <span className={cn("flex items-center justify-center font-serif underline font-semibold text-[16px] leading-none underline-offset-2", className)}>U</span>;
const IconStrike = ({ className }: { className?: string }) => <span className={cn("flex items-center justify-center font-serif line-through font-semibold text-[16px] leading-none", className)}>U</span>;
const IconSquare = ({ className }: { className?: string }) => <div className={cn("bg-current rounded-[2px] size-4", className)} />;
const IconEquals = ({ className }: { className?: string }) => <span className={cn("flex items-center justify-center font-bold text-[18px] leading-none", className)}>=</span>;
const IconFx = ({ className }: { className?: string }) => <span className={cn("flex items-center justify-center font-serif italic font-medium text-[16px] leading-none", className)}>fx</span>;

function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Type here",
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#D6E4FF] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#EDF2F7] px-3 py-2">
        <div className="flex items-center gap-1 text-[#6B7180]">
          <EditorButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            icon={IconItalic}
          />
          <EditorButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            icon={IconBold}
          />
          <EditorButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            icon={IconUnderline}
          />
          <EditorButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            icon={IconStrike}
          />
          <EditorButton
            onClick={() => { }}
            icon={LinkIcon}
          />
          <EditorButton
            onClick={() => { }}
            icon={IconSquare}
          />
          <EditorButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            icon={AlignLeft}
          />
          <EditorButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            icon={AlignCenter}
          />
          <EditorButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            icon={AlignRight}
          />
          <EditorButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            icon={List}
          />
          <div className="flex items-center gap-1 rounded-[8px] bg-[#F8FAFF] p-1 text-[#1C1B1F]">
            <EditorButton
              onClick={() => { }}
              icon={CalculatorIcon}
            />
            <EditorButton
              onClick={() => { }}
              icon={IconEquals}
            />
            <EditorButton
              onClick={() => { }}
              icon={PhotoIcon}
            />
            <EditorButton
              onClick={() => { }}
              icon={IconFx}
            />
          </div>
        </div>

      </div>

      <div className="relative">
        <EditorContent
          editor={editor}
          className="question-editor min-h-[168px] px-4 py-4 pr-10 text-sm text-content-body"
        />
        {editor.getText() ? (
          <button
            type="button"
            onClick={() => editor.chain().focus().clearContent(true).run()}
            className="absolute right-4 top-4 text-[#D1D5DB] hover:text-red-500 transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function EditorButton({
  icon: Icon,
  isActive,
  onClick,
}: {
  icon: ComponentType<any>;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 transition-colors hover:bg-[#F5F8FD]",
        isActive && "bg-brand-light text-[#355FF5]",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

function htmlToPlainText(value: string) {
  if (typeof window === "undefined") {
    return value.replace(/<[^>]+>/g, " ").trim();
  }

  const element = window.document.createElement("div");
  element.innerHTML = value;
  return element.textContent?.trim() ?? "";
}

function parseCsvQuestions(text: string, draftMeta: TestDraftMeta | null) {
  const rows = text
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    return [];
  }

  const headers = splitCsvRow(rows[0]).map((header) => header.trim());

  return rows.slice(1).map((row) => {
    const values = splitCsvRow(row);
    const record = headers.reduce<Record<string, string>>((result, header, index) => {
      result[header] = values[index]?.trim() ?? "";
      return result;
    }, {});

    const options = [
      record.optionA ?? "",
      record.optionB ?? "",
      record.optionC ?? "",
      record.optionD ?? "",
    ].map((optionText, index) => ({
      id: `imported-option-${index}-${Math.random().toString(36).slice(2, 8)}`,
      text: optionText,
    }));

    const correctIndex = Math.max(
      0,
      ["A", "B", "C", "D"].indexOf((record.correctOption || "A").toUpperCase()),
    );

    return createBlankQuestion({
      questionText: record.questionText ?? "",
      questionHtml: `<p>${escapeHtml(record.questionText ?? "")}</p>`,
      options,
      correctOptionId: options[correctIndex]?.id ?? options[0]?.id ?? "",
      solution: record.solution ?? "",
      difficulty:
        record.difficulty === "Medium" || record.difficulty === "Difficult"
          ? record.difficulty
          : draftMeta?.difficulty ?? "Easy",
      topicName: record.topic ?? draftMeta?.topicName ?? "",
      subTopicName: record.subTopic ?? draftMeta?.subTopicName ?? "",
    });
  });
}

function splitCsvRow(row: string) {
  const values: string[] = [];
  let current = "";
  let isQuoted = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];

    if (character === '"') {
      if (isQuoted && row[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        isQuoted = !isQuoted;
      }
      continue;
    }

    if (character === "," && !isQuoted) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);
  return values;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
