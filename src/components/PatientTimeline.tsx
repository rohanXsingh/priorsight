import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Patient } from "@/types";

interface PatientTimelineProps {
  patient: Patient;
}

type Filter = "all" | "labs" | "imaging" | "external";

export function PatientTimeline({ patient }: PatientTimelineProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedTest, setSelectedTest] = useState<Patient["priorTests"][0] | null>(null);

  const filteredTests = patient.priorTests.filter((test) => {
    if (filter === "all") return true;
    if (filter === "external") return test.source === "External";
    if (filter === "labs") return test.category === "Labs";
    if (filter === "imaging") return test.category === "Imaging";
    return true;
  });

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "labs", label: "Labs" },
    { id: "imaging", label: "Imaging" },
    { id: "external", label: "External only" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Patient Timeline</h2>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.id
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredTests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No tests match the selected filter.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
          <div className="space-y-6">
            {filteredTests.map((test) => (
              <button
                key={test.id}
                onClick={() => setSelectedTest(test)}
                className="relative flex items-start gap-4 w-full text-left group"
              >
                <div className="absolute left-4 top-2 -translate-x-1/2 w-3 h-3 rounded-full bg-teal-600 border-2 border-white shadow" />
                <div className="ml-10 flex-1 bg-slate-50 rounded-lg p-4 group-hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{test.testName}</h3>
                    <Badge
                      variant="secondary"
                      className={
                        test.source === "External"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-teal-100 text-teal-700 border-teal-200"
                      }
                    >
                      {test.source}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {test.date} · {test.daysAgo} days ago · {test.facility}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">{test.result}</p>
                  <span className="text-xs text-teal-600 mt-2 inline-block">
                    View report →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!selectedTest} onOpenChange={(open) => !open && setSelectedTest(null)}>
        <DialogContent>
          {selectedTest && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-slate-900">
                  {selectedTest.testName}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Date:</span> {selectedTest.date}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    <span className="font-medium">Facility:</span> {selectedTest.facility}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    <span className="font-medium">Result:</span> {selectedTest.result}
                  </p>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Impression</h4>
                  <p className="text-sm text-slate-600">{selectedTest.report.impression}</p>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Key Findings</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedTest.report.keyFindings.map((finding, i) => (
                      <li key={i} className="text-sm text-slate-600">{finding}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}