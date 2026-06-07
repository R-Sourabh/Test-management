import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarIcon as Calendar, ChevronDownIcon as ChevronDown } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/button";
import { useTestCreationStore } from "@/store/testCreationStore";
import { ROUTES } from "@/lib/constants";
import { createTest } from "@/features/tests/api";
import { getSubjects, getTopicsBySubject, getSubTopicsByTopic } from "@/features/taxonomy/api";
import {
  buildTestDraftMeta,
  EditTestCreationModal,
  getTestFormState,
  type TestFormState,
  updateTestFormField,
} from "@/features/tests/testCreationForm";
import { bulkCreateQuestions } from "@/features/questions/api";
import type { PublishedQuestionPayload } from "@/features/questions/types";
import { TestSummaryHeader } from "@/features/tests/TestSummaryHeader";

function htmlToPlainText(html: string) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour24 = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 < 12 ? "AM" : "PM";
  return {
    value: `${hour24.toString().padStart(2, '0')}:${minute}`,
    label: `${hour12}:${minute} ${ampm}`
  };
});

function TimeSelect({ placeholder }: { placeholder: string }) {
  const [value, setValue] = React.useState("");

  return (
    <div className="relative flex-1">
      <select 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`w-full appearance-none rounded-[8px] border border-surface-input bg-white px-4 py-3 text-sm outline-none focus:border-[#B8C8F4] cursor-pointer ${
          value ? "text-content-main" : "text-[#C1C9D6]"
        }`}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {TIME_OPTIONS.map((time) => (
          <option key={time.value} value={time.value} className="text-content-main">
            {time.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 size-6 -translate-y-1/2 text-content-lightest pointer-events-none" />
    </div>
  );
}

function DatePickerInput({ placeholder }: { placeholder: string }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState("");
  
  return (
    <div 
      className="relative flex-1 cursor-pointer"
      onClick={() => inputRef.current?.showPicker()}
    >
      <input 
        ref={inputRef}
        type="date" 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`w-full cursor-pointer rounded-[8px] border border-surface-input px-4 py-3 text-sm outline-none focus:border-[#B8C8F4] [&::-webkit-calendar-picker-indicator]:hidden ${
          value ? "text-content-main" : "text-transparent"
        }`} 
      />
      {!value && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#C1C9D6] pointer-events-none">
          {placeholder}
        </span>
      )}
      <Calendar className="absolute right-4 top-1/2 size-6 -translate-y-1/2 text-content-lightest pointer-events-none" />
    </div>
  );
}

export function PreviewPublishPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [publishTab, setPublishTab] = useState<"now" | "schedule">("now");
  const [durationPreset, setDurationPreset] = useState("Custom Duration");
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const draftMeta = useTestCreationStore((state) => state.testMeta);
  const questions = useTestCreationStore((state) => state.questions);
  const clearDraft = useTestCreationStore((state) => state.clearDraft);
  const setTestMeta = useTestCreationStore((state) => state.setTestMeta);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<TestFormState>(() =>
    getTestFormState(draftMeta),
  );

  const totalQuestions = Math.max(Number(draftMeta?.questionCount) || 0, questions.length, 1);

  function handleCancel() {
    navigate(ROUTES.testsQuestions.replace(":id", id ?? "draft-test"));
  }

  function handleOpenEditModal() {
    setEditForm(getTestFormState(draftMeta));
    setIsEditModalOpen(true);
  }

  function handleEditField<K extends keyof TestFormState>(
    field: K,
    value: TestFormState[K],
  ) {
    setEditForm((prev) => updateTestFormField(prev, field, value));
  }

  function handleSaveEditModal() {
    if (!editForm.subject) {
      alert("Subject is required");
      return;
    }
    const newMeta = buildTestDraftMeta(editForm, draftMeta);
    setTestMeta(newMeta);
    setIsEditModalOpen(false);
  }

  /**
   * Finalizes the publishing process.
   * 1. Creates the base Test entity in the backend.
   * 2. Bulks inserts all associated questions using the newly created Test ID.
   * 3. Redirects to the dashboard upon successful completion.
   */
  async function handleConfirm() {
    try {
      setIsPublishing(true);
      setErrorMsg("");

      // Resolve subject, topic, and subtopic IDs dynamically from backend
      let resolvedSubjectId = draftMeta?.subjectId;
      let resolvedTopicId = draftMeta?.topicId;
      let resolvedSubTopicId = draftMeta?.subTopicId;

      try {
        const subjectsRes = await getSubjects();
        const subjectsList = subjectsRes.data.data || [];
        
        // Match subject
        if (draftMeta?.subjectName) {
          const match = subjectsList.find(
            (s) => s.name.toLowerCase() === draftMeta.subjectName.toLowerCase()
          );
          if (match) {
            resolvedSubjectId = match.id;
          }
        }
        
        // Fallback
        if (!resolvedSubjectId && subjectsList.length > 0) {
          resolvedSubjectId = subjectsList[0].id;
        }

        if (resolvedSubjectId) {
          const topicsRes = await getTopicsBySubject(resolvedSubjectId);
          const subjectTopics = topicsRes.data.data || [];

          if (draftMeta?.topicName) {
            let match = subjectTopics.find(
              (t) => t.name.toLowerCase() === draftMeta.topicName.toLowerCase()
            );
            if (!match && draftMeta.subTopicName) {
              match = subjectTopics.find(
                (t) => t.name.toLowerCase() === draftMeta.subTopicName.toLowerCase()
              );
            }
            if (match) {
              resolvedTopicId = match.id;
            }
          }

          if (!resolvedTopicId && subjectTopics.length > 0) {
            resolvedTopicId = subjectTopics[0].id;
          }

          if (resolvedTopicId) {
            const subtopicsRes = await getSubTopicsByTopic(resolvedTopicId);
            const topicSubtopics = subtopicsRes.data.data || [];

            if (draftMeta?.subTopicName) {
              const match = topicSubtopics.find(
                (st) => st.name.toLowerCase() === draftMeta.subTopicName.toLowerCase()
              );
              if (match) {
                resolvedSubTopicId = match.id;
              }
            }

            if (!resolvedSubTopicId && topicSubtopics.length > 0) {
              resolvedSubTopicId = topicSubtopics[0].id;
            }
          }
        }
      } catch (err) {
        console.error("Error resolving taxonomy IDs:", err);
      }

      // 1. Create Test
      const modeMap: Record<string, string> = {
        "Chapter Wise": "chapterwise",
        "PYQ": "pyq",
        "Mock Test": "mock",
      };
      const testType = modeMap[draftMeta?.mode || ""] || "chapterwise";

      const testPayload = {
        name: draftMeta?.testName || "Draft Test",
        type: testType,
        subject: resolvedSubjectId || "",
        topics: resolvedTopicId ? [resolvedTopicId] : [],
        sub_topics: resolvedSubTopicId ? [resolvedSubTopicId] : [],
        correct_marks: Number(draftMeta?.correctAnswer || 1),
        wrong_marks: Number(draftMeta?.wrongAnswer || 0),
        unattempt_marks: Number(draftMeta?.unattempted || 0),
        difficulty: (draftMeta?.difficulty || "Easy").toLowerCase(),
        total_time: Number(draftMeta?.duration || 60),
        total_marks: Number(draftMeta?.totalMarks || 100),
        total_questions: totalQuestions,
        status: "live",
      };

      let currentTestId = id;

      if (!currentTestId || currentTestId === "draft-test") {
        const createRes = await createTest(testPayload);
        if (!createRes.data.success) {
          throw new Error("Failed to create test");
        }
        currentTestId = createRes.data.data.id;
      }

      // 2. Bulk Create Questions
      const questionsPayload: PublishedQuestionPayload[] = questions.map((q) => ({
        questionText: htmlToPlainText(q.questionHtml),
        questionHtml: q.questionHtml,
        type: "mcq",
        options: q.options.map((opt) => ({
          text: opt.text,
          isCorrect: opt.id === q.correctOptionId,
        })),
        solution: q.solution,
        difficulty: (q.difficulty || draftMeta?.difficulty || "Easy").toLowerCase() as any,
        topicId: q.topicId || resolvedTopicId,
        subTopicId: q.subTopicId || resolvedSubTopicId,
      }));

      await bulkCreateQuestions({
        testId: currentTestId,
        questions: questionsPayload,
      });

      // 3. Clear draft and go to dashboard
      clearDraft();
      navigate(ROUTES.dashboard);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to publish the test. Please check all details.");
      setIsPublishing(false);
    }
  }

  return (
    <div className="-mx-4 -mt-5 min-h-[calc(100vh-100px)] bg-white sm:-mx-6">

      <div className="px-4 py-8 sm:px-6">
        <div className="text-sm text-content-subtle mb-8">
          Test creation
        </div>

      <div className="w-full">
        {errorMsg && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-base font-semibold text-[#374151]">Test created</h2>
          <div className="flex items-center gap-1.5 rounded-lg border border-status-success-border px-3 py-2 text-xs font-medium text-status-success">
            <CheckCircleSolid className="size-3.5" />
            All {totalQuestions} Questions done
          </div>
        </div>

        {/* Test details card */}
        <TestSummaryHeader onEditClick={handleOpenEditModal} className="rounded-lg border border-surface-card bg-white px-5 py-5 mb-8" />

        {/* Publish Type Tabs */}
        <div className="flex items-center w-[300px] mb-8 rounded-[8px] border border-surface-card bg-white p-1">
          <button
            type="button"
            onClick={() => setPublishTab("now")}
            className={`flex-1 rounded-[6px] py-1 text-sm font-bold transition-colors ${
              publishTab === "now" ? "bg-surface-hover text-brand-dark" : "text-content-lighter hover:text-brand-dark"
            }`}
          >
            Publish Now
          </button>
          <button
            type="button"
            onClick={() => setPublishTab("schedule")}
            className={`flex-1 rounded-[6px] py-1 text-sm font-bold transition-colors ${
              publishTab === "schedule" ? "bg-surface-hover text-brand-dark" : "text-content-lighter hover:text-brand-dark"
            }`}
          >
            Schedule Publish
          </button>
        </div>

        {publishTab === "schedule" && (
          <div className="mb-8">
            <h3 className="text-base font-semibold text-content-main mb-4">Select Date and Time</h3>
            <div className="flex gap-4">
              <DatePickerInput placeholder="Select Date" />
              <TimeSelect placeholder="Select Time" />
            </div>
          </div>
        )}

        {/* Live Until Section */}
        <div className="mb-10">
          <h3 className="text-base font-semibold text-content-main mb-1">Live Until</h3>
          <p className="text-sm text-content-subtle mb-6">Choose how long this test should remain available on the platform.</p>

          <div className="grid grid-cols-2 gap-y-5 gap-x-8 mb-6">
            {["Always Available", "3 Weeks", "1 Week", "1 Month", "2 Weeks", "Custom Duration"].map((duration) => (
              <label key={duration} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="duration"
                  value={duration}
                  checked={durationPreset === duration}
                  onChange={(e) => setDurationPreset(e.target.value)}
                  className="size-4 text-brand accent-brand"
                />
                <span className="text-sm text-content-body">{duration}</span>
              </label>
            ))}
          </div>

          {durationPreset === "Custom Duration" && (
            <div className="flex gap-4">
              <DatePickerInput placeholder="Select End Date" />
              <TimeSelect placeholder="Select End Time" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-12 pb-10">
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            className="min-w-[130px] rounded-[8px] border-0 bg-[#F6F8FC] text-brand hover:bg-[#EDF2FB]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPublishing}
            className="min-w-[130px] rounded-[8px] bg-brand text-white hover:bg-brand-hover"
          >
            {isPublishing ? "Confirming..." : "Confirm"}
          </Button>
        </div>
      </div>
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
