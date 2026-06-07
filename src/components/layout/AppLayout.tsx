import {
  BellIcon as Bell,
  ChevronDoubleLeftIcon as ChevronsLeft,
  PencilSquareIcon as FilePenLine,
  Squares2X2Icon as LayoutDashboard,
  ReceiptPercentIcon as ReceiptText,
  UsersIcon as Users,
  ArrowTrendingUpIcon as ArrowTrendingUp,
  PencilSquareIcon as PencilSquare,
  InformationCircleIcon as InformationCircle,
  DocumentDuplicateIcon as DocumentDuplicate,
  BuildingLibraryIcon as BuildingLibrary,
  UserCircleIcon as UserCircle,
  ArchiveBoxIcon as ArchiveBox,
  CurrencyRupeeIcon as CurrencyRupee,
  TrophyIcon as Trophy,
  ChatBubbleOvalLeftEllipsisIcon as ChatBubbleOvalLeftEllipsis,
  Cog8ToothIcon as Cog8Tooth,
  MinusCircleIcon as MinusCircle,
  ChevronDoubleRightIcon as ChevronDoubleRight,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon as ChevronDownSolid,
  CheckCircleIcon as CheckCircleSolid,
} from "@heroicons/react/20/solid";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import avatarImage from "@/assets/avatar.png";
import prepRouteLogo from "@/assets/login/preproute-logo.svg";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTestCreationStore } from "@/store/testCreationStore";

const sidebarItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: ROUTES.dashboard,
  },
  {
    label: "Test Creation",
    icon: FilePenLine,
    to: ROUTES.testsCreate,
  },
  {
    label: "Test Tracking",
    icon: ReceiptText,
    to: "/dummy-tracking" as any,
  },
];

const questionRailIcons = [
  ArrowTrendingUp,
  PencilSquare,
  InformationCircle,
  DocumentDuplicate,
  Users,
  BuildingLibrary,
  UserCircle,
  ArchiveBox,
  CurrencyRupee,
  Trophy,
  ChatBubbleOvalLeftEllipsis,
  Bell,
  Cog8Tooth,
];

export function AppLayout() {
  const location = useLocation();
  const isQuestionsPage =
    location.pathname.includes("/questions") ||
    location.pathname.includes("/preview");

  return (
    <div className="min-h-screen bg-white text-surface-dark">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        <aside className="border-r border-surface-card bg-white">
          <div className="flex h-20 items-center px-5">
            <img
              src={prepRouteLogo}
              alt="PrepRoute"
              className="h-auto w-[136px]"
            />
          </div>

          {!isQuestionsPage ? (
            <nav className="space-y-2 px-2 py-5">
              {sidebarItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={(e) => {
                      if ((item.to as string) === "/dummy-tracking") e.preventDefault();
                    }}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "border-l-[5px] border-[#384EC7] bg-[#F8FAFF] text-[#384EC7] pl-[13px] text-brand-alt"
                          : "text-[#5E6A7D] hover:bg-[#F8FAFD]",
                      ].join(" ")
                    }
                  >
                    <Icon className="size-[17px]" strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          ) : (
            <QuestionsSidebar />
          )}
        </aside>

        <div className="min-w-0 bg-white">
          <header className="flex h-20 items-center justify-end border-b border-surface-card px-6">
            <div className="flex items-center gap-6">
              <button
                type="button"
                className="relative flex size-12 items-center justify-center rounded-full border border-[#D8E1EE] text-[#1E293B]"
              >
                <Bell className="size-6" strokeWidth={1.5} />
                <span className="absolute right-[12px] top-[12px] size-2.5 rounded-full bg-[#10B981]" />
              </button>

              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-[46px] h-[46px]">
                  <div className="absolute w-[42px] h-[42px] rounded-full border-2 border-[#6366F1] bg-[#FFD68F] translate-y-[2px]" />
                  <img
                    src={avatarImage}
                    alt="Alex Wando"
                    className="relative z-10 w-[42px] -translate-y-[2px] object-contain"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center h-[46px] pt-1">
                  <p className="text-[17px] font-semibold leading-tight text-[#334155]">
                    Alex Wando
                  </p>
                  <p className="mt-1.5 text-[14px] leading-tight text-[#475569]">
                    Admin
                  </p>
                </div>
                <ChevronDownSolid className="ml-1 size-5 text-[#334155]" />
              </div>
            </div>
          </header>

          <main className="px-4 py-5 sm:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function QuestionsSidebar() {
  const questions = useTestCreationStore((state) => state.questions);
  const activeQuestionIndex = useTestCreationStore(
    (state) => state.activeQuestionIndex,
  );
  const setActiveQuestionIndex = useTestCreationStore(
    (state) => state.setActiveQuestionIndex,
  );
  const draftMeta = useTestCreationStore((state) => state.testMeta);

  const totalQuestions = Math.max(
    Number(draftMeta?.questionCount) || 0,
    questions.length,
    1,
  );

  return (
    <div className="grid min-h-[calc(100vh-80px)] grid-cols-[46px_1fr]">
      <div className="border-r border-surface-base px-2 pt-40 pb-5">
        <div className="flex flex-col items-center gap-2 text-[#6B7180]">
          {questionRailIcons.map((Icon, index) => (
            <button
              key={index}
              type="button"
              className="rounded-md p-1.5 hover:bg-[#F7F9FC]"
            >
              <Icon className="size-5" />
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 pt-40 pb-5">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-medium text-[#6B7180]">
              Question creation
            </h2>
            <ChevronsLeft className="size-4 text-[#7489FF]" />
          </div>
          <p className="mt-6 text-[13px] text-content-subtle">
            Total Questions . {totalQuestions}
          </p>
        </div>

        <div className="space-y-2">
          {questions.map((question, index) => {
            const isTouched = isQuestionTouched(question);
            const isPreviousTouched = index === 0 || isQuestionTouched(questions[index - 1]);
            const isActive = index === activeQuestionIndex;
            const isDisabled = !isTouched && !isPreviousTouched;

            return (
              <button
                key={question.id}
                type="button"
                disabled={isDisabled}
                onClick={() => setActiveQuestionIndex(index)}
                className={cn(
                  "flex w-full items-center justify-between rounded-[10px] border px-3 py-2 text-left text-xs transition-colors",
                  isActive
                    ? isTouched
                      ? "border-[#9EE6C9] bg-[#F4FFFA] text-[#0C9D61]"
                      : "border-[#6B7FF2] bg-[#F5F7FF] text-[#384EC7]"
                    : isTouched
                      ? "border-[#D7EFE3] bg-white text-[#0C9D61]"
                      : "border-[#EDF1F6] bg-[#FBFCFE] text-[#C1C9D6]",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2">
                  {isTouched ? (
                    <CheckCircleSolid className="size-4" />
                  ) : (
                    <MinusCircle className="size-4" />
                  )}
                  <span>{`Question ${index + 1}`}</span>
                </div>
                <ChevronDoubleRight className="size-3.5" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function isQuestionTouched(question: {
  questionText?: string;
  solution?: string;
  options?: Array<{ text?: string }>;
}) {
  return Boolean(
    question.questionText ||
    question.solution ||
    question.options?.some((option) => option.text?.trim()),
  );
}
