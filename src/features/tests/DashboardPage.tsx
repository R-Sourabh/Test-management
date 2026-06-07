import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PencilSquareIcon as Edit, EyeIcon as Eye, PlusIcon as Plus, MagnifyingGlassIcon as Search, TrashIcon as Trash2 } from "@heroicons/react/24/outline";

import { getTests } from "@/features/tests/api";
import { ROUTES } from "@/lib/constants";
import type { TestSummary } from "@/features/tests/types";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadTests() {
      try {
        const response = await getTests();
        if (!ignore) {
          setTests(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to load tests", error);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    loadTests();
    return () => {
      ignore = true;
    };
  }, []);

  const sortedTests = [...tests].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  const filteredTests = sortedTests.filter((test) =>
    test.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white min-h-[calc(100vh-100px)] rounded-xs border border-surface-card p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-content-main">Tests</h1>
          <p className="text-sm text-content-subtle mt-1">Manage and track your tests</p>
        </div>
        <Link to={ROUTES.testsCreate}>
          <Button className="h-[40px] rounded-[8px] bg-brand px-5 text-sm font-medium text-white hover:bg-brand-hover">
            <Plus className="mr-2 size-4" />
            Create New Test
          </Button>
        </Link>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[42px] rounded-[8px] border border-surface-input pl-10 pr-4 text-sm outline-none placeholder:text-content-lightest focus:border-[#B8C8F4]"
          />
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-content-lightest" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-surface-input">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8FAFD] text-content-subtle">
            <tr>
              <th className="px-6 py-4 font-medium">Test Name</th>
              <th className="px-6 py-4 font-medium">Subject</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Created Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-input text-content-body">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-content-subtle">
                  Loading tests...
                </td>
              </tr>
            ) : filteredTests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-content-subtle">
                  No tests found.
                </td>
              </tr>
            ) : (
              filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-[#FCFDFE] transition-colors">
                  <td className="px-6 py-4 font-medium text-content-main">{test.name}</td>
                  <td className="px-6 py-4">{test.subject}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        test.status === "live"
                          ? "bg-status-success-bg text-status-success"
                          : "bg-status-warning-bg text-status-warning"
                      }`}
                    >
                      {test.status === "live" ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-content-subtle">
                    {test.created_at ? new Date(test.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-content-lightest">
                      <button className="hover:text-brand transition-colors" title="View">
                        <Eye className="size-[18px]" />
                      </button>
                      <button className="hover:text-brand transition-colors" title="Edit">
                        <Edit className="size-[18px]" />
                      </button>
                      <button className="hover:text-status-danger-hover transition-colors" title="Delete">
                        <Trash2 className="size-[18px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
