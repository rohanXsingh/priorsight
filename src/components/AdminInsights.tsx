import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { AuditEntry, AlertRecord } from "@/types";

interface AdminInsightsProps {
  auditLog: AuditEntry[];
  alerts: AlertRecord[];
}

const weeklyData = [
  { week: "W1", alerts: 12, accepted: 8 },
  { week: "W2", alerts: 15, accepted: 10 },
  { week: "W3", alerts: 10, accepted: 7 },
  { week: "W4", alerts: 18, accepted: 12 },
  { week: "W5", alerts: 14, accepted: 9 },
  { week: "W6", alerts: 20, accepted: 14 },
  { week: "W7", alerts: 16, accepted: 11 },
  { week: "W8", alerts: 22, accepted: 15 },
];

const overrideReasons = [
  { name: "Clinical change", value: 35 },
  { name: "Prior inadequate", value: 25 },
  { name: "Image quality", value: 20 },
  { name: "Condition worsening", value: 15 },
  { name: "Other", value: 5 },
];

const COLORS = ["#0d9488", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444"];

export function AdminInsights({ auditLog, alerts }: AdminInsightsProps) {
  const totalAlerts = alerts.length;
  const cancelled = alerts.filter((a) => a.outcome === "cancelled").length;
  const overridden = alerts.filter((a) => a.outcome === "overridden").length;
  const modified = alerts.filter((a) => a.outcome === "modified").length;
  const avoidedTests = cancelled + modified;
  const avoidedCost = avoidedTests * 350;

  const acceptanceRate = totalAlerts > 0
    ? Math.round(((totalAlerts - overridden) / totalAlerts) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Alerts Shown</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalAlerts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Orders Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-teal-600">{cancelled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Orders Overridden</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{overridden}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Estimated Avoided Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{avoidedTests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Est. Avoided Cost*</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">${avoidedCost.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">*Illustrative</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Alerts per Week (Last 8 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="alerts" name="Alerts" fill="#0d9488" />
                  <Bar dataKey="accepted" name="Accepted" fill="#99f6e4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Override Reasons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overrideReasons}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {overrideReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Alert Acceptance Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${acceptanceRate}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">{acceptanceRate}%</span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {totalAlerts - overridden} of {totalAlerts} alerts resulted in order modification or cancellation
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          {auditLog.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No audit entries yet. Place an order to see activity here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-medium text-slate-500">Time</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500">User</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500">Patient</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500">Test</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500">Action</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 px-3 text-slate-600">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{entry.user}</td>
                      <td className="py-2 px-3 text-slate-600">{entry.patientName}</td>
                      <td className="py-2 px-3 text-slate-600">{entry.testName}</td>
                      <td className="py-2 px-3">
                        <Badge
                          variant="secondary"
                          className={
                            entry.action === "cancelled"
                              ? "bg-teal-50 text-teal-700 border-teal-200"
                              : entry.action === "overridden"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }
                        >
                          {entry.action}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{entry.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}