import { useState } from "react";
import { OrderEntry } from "@/components/OrderEntry";
import { PatientTimeline } from "@/components/PatientTimeline";
import { AdminInsights } from "@/components/AdminInsights";
import { PatientBanner } from "@/components/PatientBanner";
import { patients, initialAuditLog, initialAlerts } from "@/lib/data";
import type { AuditEntry, AlertRecord, PlacedOrder } from "@/types";

type Tab = "order" | "timeline" | "admin";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("order");
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0].id);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(initialAuditLog);
  const [alerts, setAlerts] = useState<AlertRecord[]>(initialAlerts);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)!;

  const addAuditEntry = (entry: Omit<AuditEntry, "id" | "timestamp" | "user">) => {
    const newEntry: AuditEntry = {
      ...entry,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: "Dr. Demo",
    };
    setAuditLog((prev) => [newEntry, ...prev]);
    // Any outcome other than "cancelled" means an order was actually placed.
    const action = entry.action;
    if (action !== "cancelled") {
      setPlacedOrders((prev) => [
        {
          id: newEntry.id,
          patientId: entry.patientId,
          testName: entry.testName,
          action,
          timestamp: newEntry.timestamp,
        },
        ...prev,
      ]);
    }
  };

  const addAlert = (alert: Omit<AlertRecord, "id" | "date">) => {
    const newAlert: AlertRecord = {
      ...alert,
      id: `alert-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "order", label: "Order Entry" },
    { id: "timeline", label: "Patient Timeline" },
    { id: "admin", label: "Admin Insights" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-teal-700 text-white text-center py-1.5 text-sm font-medium">
        Prototype. All patient data is synthetic.
      </div>

      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">PriorSight</h1>
                <p className="text-xs text-slate-500">Clinical Decision Support</p>
              </div>
            </div>
            <nav className="flex gap-1" aria-label="Main navigation">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <PatientBanner
        patient={selectedPatient}
        patients={patients}
        onSelectPatient={setSelectedPatientId}
      />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === "order" && (
          <OrderEntry
            patient={selectedPatient}
            onAudit={addAuditEntry}
            onAlert={addAlert}
          />
        )}
        {activeTab === "timeline" && (
          <PatientTimeline patient={selectedPatient} orders={placedOrders} />
        )}
        {activeTab === "admin" && (
          <AdminInsights
            auditLog={auditLog}
            alerts={alerts}
          />
        )}
      </main>
    </div>
  );
}