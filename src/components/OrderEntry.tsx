import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { testCatalog, duplicateWindows, checkForDuplicate } from "@/lib/data";
import type { Patient, AuditEntry, AlertRecord } from "@/types";

interface OrderEntryProps {
  patient: Patient;
  onAudit: (entry: Omit<AuditEntry, "id" | "timestamp" | "user">) => void;
  onAlert: (alert: Omit<AlertRecord, "id" | "date">) => void;
}

type ModalState = {
  testName: string;
  priorTest: Patient["priorTests"][0];
  reason: string;
} | null;

export function OrderEntry({ patient, onAudit, onAlert }: OrderEntryProps) {
  const [search, setSearch] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [priority, setPriority] = useState<"Routine" | "Urgent">("Routine");
  const [indication, setIndication] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [showReport, setShowReport] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [showOverrideSelect, setShowOverrideSelect] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  const filteredTests = testCatalog.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePlaceOrder = () => {
    // Accept a typed exact name, or a single search match, without requiring a click on the suggestion.
    const typed = search.trim().toLowerCase();
    const exact = testCatalog.find((t) => t.name.toLowerCase() === typed);
    const resolvedName =
      selectedTest || exact?.name || (filteredTests.length === 1 ? filteredTests[0].name : "");

    if (!resolvedName) {
      toast.error("Please choose a test from the suggestions list");
      return;
    }
    if (!indication.trim()) {
      toast.error("Please provide a clinical indication");
      return;
    }
    if (!selectedTest) {
      setSelectedTest(resolvedName);
      setSearch(resolvedName);
    }

    setIsPlacing(true);
    setTimeout(() => {
      const test = testCatalog.find((t) => t.name === resolvedName)!;
      const duplicate = checkForDuplicate(patient, test);

      if (duplicate) {
        const window = duplicateWindows[test.category];
        const reason =
          duplicate.testName === test.name
            ? `Same test done within the ${window}-day review window.`
            : `Same type of scan and same body area done within the ${window}-day review window.`;
        setModal({
          testName: test.name,
          priorTest: duplicate,
          reason,
        });
        onAlert({
          patientId: patient.id,
          patientName: patient.name,
          testName: test.name,
          type: "duplicate",
          outcome: "pending",
        });
      } else if (duplicate === null) {
        // Outside window - informational note
        const prior = patient.priorTests.find((p) => p.testName === test.name);
        toast.info(
          `Similar test found ${prior?.daysAgo} days ago at ${prior?.facility}. Outside the ${duplicateWindows[test.category]}-day review window.`
        );
        onAudit({
          action: "ordered",
          patientId: patient.id,
          patientName: patient.name,
          testName: test.name,
          reason: "Outside duplicate window - informational only",
        });
      } else {
        toast.success(`Order placed for ${test.name}`);
        onAudit({
          action: "ordered",
          patientId: patient.id,
          patientName: patient.name,
          testName: test.name,
          reason: "No prior test found",
        });
      }
      setIsPlacing(false);
    }, 800);
  };

  const handleCancel = () => {
    if (!modal) return;
    onAudit({
      action: "cancelled",
      patientId: patient.id,
      patientName: patient.name,
      testName: modal.testName,
      reason: "Using prior result",
    });
    onAlert({
      patientId: patient.id,
      patientName: patient.name,
      testName: modal.testName,
      type: "duplicate",
      outcome: "cancelled",
    });
    toast.success("Order cancelled. Prior result will be used.");
    setModal(null);
    setShowReport(false);
    setShowOverrideSelect(false);
    setOverrideReason("");
    setOtherReason("");
  };

  const handleOrderAnyway = () => {
    if (!modal) return;
    if (!overrideReason) {
      toast.error("Please select a reason for overriding");
      return;
    }
    if (overrideReason === "Other" && !otherReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    const finalReason = overrideReason === "Other" ? otherReason : overrideReason;
    onAudit({
      action: "overridden",
      patientId: patient.id,
      patientName: patient.name,
      testName: modal.testName,
      reason: finalReason,
    });
    onAlert({
      patientId: patient.id,
      patientName: patient.name,
      testName: modal.testName,
      type: "duplicate",
      outcome: "overridden",
    });
    toast.success("Order placed despite duplicate alert");
    setModal(null);
    setShowReport(false);
    setShowOverrideSelect(false);
    setOverrideReason("");
    setOtherReason("");
  };

  const handleModified = () => {
    if (!modal) return;
    onAudit({
      action: "modified",
      patientId: patient.id,
      patientName: patient.name,
      testName: modal.testName,
      reason: "Ordered modified test",
    });
    onAlert({
      patientId: patient.id,
      patientName: patient.name,
      testName: modal.testName,
      type: "duplicate",
      outcome: "modified",
    });
    toast.success("Modified test order placed");
    setModal(null);
    setShowReport(false);
    setShowOverrideSelect(false);
    setOverrideReason("");
    setOtherReason("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">New Test Order</h2>

          <div className="space-y-6">
            <div>
              <Label htmlFor="test-search" className="text-sm font-medium text-slate-700">
                Test Search
              </Label>
              <Input
                id="test-search"
                type="text"
                placeholder="Type to search tests..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedTest("");
                }}
                className="mt-1.5"
                aria-label="Search for a test"
              />
              {search && !selectedTest && (
                <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
                  {filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                      <button
                        key={test.id}
                        onClick={() => {
                          setSelectedTest(test.name);
                          setSearch(test.name);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-teal-50 transition-colors"
                      >
                        <span className="font-medium text-slate-900">{test.name}</span>
                        <span className="ml-2 text-xs text-slate-500">{test.category}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">No tests found</div>
                  )}
                </div>
              )}
              {selectedTest && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-medium text-teal-700">{selectedTest}</span>
                  <button
                    onClick={() => {
                      setSelectedTest("");
                      setSearch("");
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700">Priority</Label>
              <RadioGroup
                value={priority}
                onValueChange={(v) => setPriority(v as "Routine" | "Urgent")}
                className="mt-1.5 flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Routine" id="routine" />
                  <Label htmlFor="routine" className="text-sm">Routine</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Urgent" id="urgent" />
                  <Label htmlFor="urgent" className="text-sm">Urgent</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="indication" className="text-sm font-medium text-slate-700">
                Clinical Indication
              </Label>
              <Textarea
                id="indication"
                placeholder="e.g. Persistent cough, rule out pneumonia"
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={isPlacing}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isPlacing ? "Checking for duplicates..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Duplicate Review Windows</h3>
          <div className="space-y-3">
            {Object.entries(duplicateWindows).map(([category, days]) => (
              <div key={category} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600">{category}</span>
                <span className="text-sm font-medium text-slate-900">{days} days</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Illustrative windows. To be validated clinically.
          </p>
        </div>
      </div>

      <Dialog open={!!modal} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="max-w-2xl">
          {modal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  Possible duplicate test
                </DialogTitle>
                <DialogDescription className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                  {modal.reason}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{modal.priorTest.testName}</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        {modal.priorTest.date} · {modal.priorTest.daysAgo} days ago
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      modal.priorTest.source === "External"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-teal-100 text-teal-700"
                    }`}>
                      {modal.priorTest.source}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    Facility: {modal.priorTest.facility}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Result: {modal.priorTest.result}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Matched on Patient ID: <span className="font-mono">{patient.patientUid}</span>
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowReport(!showReport)}
                  className="mt-3"
                >
                  {showReport ? "Hide prior report" : "View prior report"}
                </Button>

                {showReport && (
                  <div className="mt-3 bg-white border border-slate-200 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-900 mb-2">Report Preview</h5>
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-medium">Impression:</span> {modal.priorTest.report.impression}
                    </p>
                    <div>
                      <span className="text-sm font-medium text-slate-700">Key Findings:</span>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {modal.priorTest.report.keyFindings.map((finding, i) => (
                          <li key={i} className="text-sm text-slate-600">{finding}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {!showOverrideSelect ? (
                  <div className="mt-6 space-y-3">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Cancel order, use prior result
                    </Button>
                    <Button
                      onClick={() => setShowOverrideSelect(true)}
                      variant="outline"
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      Order anyway
                    </Button>
                    <Button
                      onClick={handleModified}
                      variant="outline"
                      className="w-full border-teal-300 text-teal-700 hover:bg-teal-50"
                    >
                      Order modified test
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <Label htmlFor="override-reason" className="text-sm font-medium text-slate-700">
                      Reason for overriding
                    </Label>
                    <Select value={overrideReason} onValueChange={setOverrideReason}>
                      <SelectTrigger id="override-reason" className="w-full">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clinical change since last test">Clinical change since last test</SelectItem>
                        <SelectItem value="Prior result inadequate">Prior result inadequate</SelectItem>
                        <SelectItem value="Prior image quality poor">Prior image quality poor</SelectItem>
                        <SelectItem value="Patient condition worsening">Patient condition worsening</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {overrideReason === "Other" && (
                      <Input
                        type="text"
                        placeholder="Please specify reason"
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                        className="mt-2"
                      />
                    )}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleOrderAnyway}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        Confirm override
                      </Button>
                      <Button
                        onClick={() => setShowOverrideSelect(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                )}

                <p className="mt-4 text-xs text-slate-500 text-center">
                  Final decision rests with the clinician.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}