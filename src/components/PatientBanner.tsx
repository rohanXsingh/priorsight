import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "@/types";

interface PatientBannerProps {
  patient: Patient;
  patients: Patient[];
  onSelectPatient: (id: string) => void;
}

export function PatientBanner({ patient, patients, onSelectPatient }: PatientBannerProps) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-700 font-semibold text-lg">
                {patient.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{patient.name}</h2>
              <p className="text-sm text-slate-500">
                {patient.age} yrs · {patient.sex} · MRN: {patient.mrn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Allergies:</span>
            {patient.allergies.length > 0 ? (
              <div className="flex gap-1">
                {patient.allergies.map((allergy) => (
                  <Badge key={allergy} variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                    {allergy}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-400">None recorded</span>
            )}
          </div>

          <div className="ml-auto">
            <Select value={patient.id} onValueChange={onSelectPatient}>
              <SelectTrigger className="w-64" aria-label="Select patient">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {p.age} {p.sex}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}