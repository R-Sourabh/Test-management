import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { useTestCreationStore } from "@/store/testCreationStore";

import {
  buildTestDraftMeta,
  getTestFormState,
  initialTestFormState,
  TestCreationFormFields,
  type TestFormState,
  updateTestFormField,
} from "./testCreationForm";

export function CreateEditTestPage() {
  const navigate = useNavigate();
  const draftMeta = useTestCreationStore((state) => state.testMeta);
  const setTestMeta = useTestCreationStore((state) => state.setTestMeta);
  const initializeQuestions = useTestCreationStore(
    (state) => state.initializeQuestions,
  );
  const [form, setForm] = useState<TestFormState>(() => getTestFormState(draftMeta));

  function updateField<K extends keyof TestFormState>(
    key: K,
    value: TestFormState[K],
  ) {
    setForm((current) => updateTestFormField(current, key, value));
  }

  function handleCancel() {
    setForm(initialTestFormState);
  }

  function handleNext() {
    const nextMeta = buildTestDraftMeta(form, draftMeta);

    setTestMeta(nextMeta);
    initializeQuestions(Number(form.questionCount) || 1);
    navigate(ROUTES.testsQuestions.replace(":id", "draft-test"));
  }

  return (
    <div className="min-h-[calc(100vh-121px)] rounded-none bg-white">
      <div className="mb-5 pb-5 text-sm text-content-subtle">
        Test Creation <span className="mx-2 text-[#B5BFCC]">/</span> Create Test{" "}
        <span className="mx-2 text-[#B5BFCC]">/</span>
        <span className="text-content-muted">Chapter Wise</span>
      </div>

      <div className="max-w-[1200px]">
        <TestCreationFormFields form={form} onChange={updateField} />

        <div className="mt-10 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="h-[40px] min-w-[128px] rounded-[8px] border-0 bg-[#F6F8FC] text-sm font-medium text-brand-alt hover:bg-[#EDF2FB]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            className="h-[40px] min-w-[128px] rounded-[8px] border-0 bg-[#6B7FF2] text-sm font-medium text-white hover:bg-[#5D72EA]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
