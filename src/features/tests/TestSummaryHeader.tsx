import type { ComponentType } from "react";
import {
  BellIcon as Bell,
  QuestionMarkCircleIcon as QuestionMark,
  ChartBarIcon as Sigma,
} from "@heroicons/react/24/outline";
import { PencilIcon as PencilSolid } from "@heroicons/react/20/solid";
import { EasyIcon } from "@/assets/icons/EasyIcon";
import ChapterLogo from "@/assets/icons/Chapterlogo.png";
import { useTestCreationStore } from "@/store/testCreationStore";

function Divider() {
  return <span className="h-4 w-px bg-[#E5EAF1]" />;
}

function SummaryStat({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="size-3.5" /> {text}
    </span>
  );
}

interface TestSummaryHeaderProps {
  onEditClick: () => void;
  className?: string;
}

export function TestSummaryHeader({
  onEditClick,
  className = "mb-8 rounded-md border border-surface-card bg-white px-5 py-5",
}: TestSummaryHeaderProps) {
  const draftMeta = useTestCreationStore((state) => state.testMeta);
  const questions = useTestCreationStore((state) => state.questions);

  const totalQuestions = Math.max(
    Number(draftMeta?.questionCount) || 0,
    questions.length,
    1,
  );

  const topicSummary = [draftMeta?.topicName].filter(Boolean) as string[];
  const subTopicSummary = [draftMeta?.subTopicName].filter(Boolean) as string[];

  return (
    <div className={className}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-full bg-brand-dark px-3 py-1 text-xs font-medium text-white">
            {draftMeta?.mode ?? "Chapter Wise"}
          </span>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <img src={ChapterLogo} alt="Chapter" className="size-5" />
              <h3 className="text-[16px] font-semibold text-[#000000]">
                {draftMeta?.testName || "Chapter 1"}
              </h3>
            </div>
            <span className="flex w-[100px] items-center justify-center gap-2 rounded-full bg-[#2AB7A9] px-[10px] py-[2px] font-['Inter'] text-[14px] font-normal text-white">
              <EasyIcon className="text-[#FEFEFF]" />
              {draftMeta?.difficulty ?? "Easy"}
            </span>
          </div>
        </div>

        <button type="button" onClick={onEditClick}>
          <PencilSolid className="size-4 text-[#7489FF]" />
        </button>
      </div>

      <div className="flex flex-col justify-between gap-4 text-sm text-content-subtle md:flex-row md:items-end">
        <div className="grid grid-cols-[98px_1fr] items-center gap-y-3">
          <p>Subject</p>
          <div className="flex items-center gap-2 text-content-muted">
            <span>:</span>
            <p>{draftMeta?.subjectName || ""}</p>
          </div>

          <p>Topic</p>
          <div className="flex flex-wrap items-center gap-2 text-content-muted">
            <span>:</span>
            {topicSummary.length ? (
              topicSummary.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-status-warning-border bg-status-warning-bg px-3 py-1 text-xs text-status-warning"
                >
                  {topic}
                </span>
              ))
            ) : (
              ""
            )}
          </div>

          <p>Sub Topic</p>
          <div className="flex flex-wrap items-center gap-2 text-content-muted">
            <span>:</span>
            {subTopicSummary.length ? (
              subTopicSummary.map((subTopic) => (
                <span
                  key={subTopic}
                  className="rounded-full border border-status-warning-border bg-status-warning-bg px-3 py-1 text-xs text-status-warning"
                >
                  {subTopic}
                </span>
              ))
            ) : (
              ""
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-surface-card px-3 py-2 text-[13px] text-content-subtle">
          <SummaryStat icon={Bell} text={`${draftMeta?.duration || "0"} Min`} />
          <Divider />
          <SummaryStat icon={QuestionMark} text={`${totalQuestions} Q's`} />
          <Divider />
          <SummaryStat
            icon={Sigma}
            text={`${draftMeta?.totalMarks || "0"} Marks`}
          />
        </div>
      </div>
    </div>
  );
}
