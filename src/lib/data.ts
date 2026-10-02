import type { Patient, TestDefinition, AuditEntry, AlertRecord } from "@/types";

export const testCatalog: TestDefinition[] = [
  { id: "ct-chest", name: "CT Chest with Contrast", category: "Imaging", modality: "CT", bodyRegion: "Chest" },
  { id: "ct-abdomen", name: "CT Abdomen", category: "Imaging", modality: "CT", bodyRegion: "Abdomen" },
  { id: "ct-head", name: "CT Head", category: "Imaging", modality: "CT", bodyRegion: "Head" },
  { id: "mri-brain", name: "MRI Brain", category: "Imaging", modality: "MRI", bodyRegion: "Head" },
  { id: "mri-spine", name: "MRI Lumbar Spine", category: "Imaging", modality: "MRI", bodyRegion: "Spine" },
  { id: "cxr", name: "Chest X-Ray", category: "Imaging", modality: "X-ray", bodyRegion: "Chest" },
  { id: "echo", name: "Echocardiogram", category: "Imaging", modality: "Echo", bodyRegion: "Chest" },
  { id: "hba1c", name: "HbA1c", category: "Labs", modality: "Lab", bodyRegion: "Blood" },
  { id: "lipid", name: "Lipid Panel", category: "Labs", modality: "Lab", bodyRegion: "Blood" },
  { id: "cbc", name: "CBC", category: "Labs", modality: "Lab", bodyRegion: "Blood" },
  { id: "bmp", name: "Basic Metabolic Panel", category: "Labs", modality: "Lab", bodyRegion: "Blood" },
  { id: "tsh", name: "TSH", category: "Labs", modality: "Lab", bodyRegion: "Blood" },
  { id: "us-abdomen", name: "Ultrasound Abdomen", category: "Imaging", modality: "Ultrasound", bodyRegion: "Abdomen" },
  { id: "mammogram", name: "Mammogram", category: "Imaging", modality: "X-ray", bodyRegion: "Breast" },
  { id: "ekg", name: "EKG", category: "Imaging", modality: "ECG", bodyRegion: "Chest" },
];

export const duplicateWindows: Record<string, number> = {
  Imaging: 90,
  Labs: 30,
};

export const patients: Patient[] = [
  {
    id: "p1",
    name: "Maria Gonzalez",
    age: 58,
    sex: "F",
    mrn: "MRN-78421",
    patientUid: "PS-4829-1730-55",
    allergies: ["Penicillin"],
    priorTests: [
      {
        id: "pt1",
        testName: "CT Chest with Contrast",
        date: "2024-11-15",
        daysAgo: 21,
        facility: "Riverside Community Hospital",
        source: "External",
        category: "Imaging",
        result: "No acute cardiopulmonary process",
        report: {
          impression: "No acute pulmonary embolism. Mild bilateral atelectasis.",
          keyFindings: [
            "No pulmonary embolism identified",
            "Mild dependent atelectasis bilaterally",
            "No pleural effusion",
            "Cardiac silhouette within normal limits",
          ],
        },
      },
      {
        id: "pt2",
        testName: "CBC",
        date: "2024-10-20",
        daysAgo: 47,
        facility: "This hospital",
        source: "This hospital",
        category: "Labs",
        result: "WBC 7.2, Hgb 13.1, Plt 245",
        report: {
          impression: "Within normal limits",
          keyFindings: [
            "WBC count normal",
            "Hemoglobin normal",
            "Platelet count normal",
          ],
        },
      },
    ],
  },
  {
    id: "p2",
    name: "James Carter",
    age: 64,
    sex: "M",
    mrn: "MRN-55932",
    patientUid: "PS-7315-4026-80",
    allergies: ["Sulfa"],
    priorTests: [
      {
        id: "pt3",
        testName: "HbA1c",
        date: "2024-08-15",
        daysAgo: 140,
        facility: "Lakeview Clinic",
        source: "External",
        category: "Labs",
        result: "7.2%",
        report: {
          impression: "Elevated HbA1c consistent with diabetes",
          keyFindings: [
            "HbA1c 7.2%",
            "Above target range",
            "Recommend lifestyle modification",
          ],
        },
      },
      {
        id: "pt4",
        testName: "Lipid Panel",
        date: "2024-12-20",
        daysAgo: 12,
        facility: "This hospital",
        source: "This hospital",
        category: "Labs",
        result: "LDL 145, HDL 38, TG 180",
        report: {
          impression: "Dyslipidemia",
          keyFindings: [
            "Elevated LDL cholesterol",
            "Low HDL cholesterol",
            "Elevated triglycerides",
          ],
        },
      },
    ],
  },
  {
    id: "p3",
    name: "Aisha Khan",
    age: 41,
    sex: "F",
    mrn: "MRN-90317",
    patientUid: "PS-1952-0684-74",
    allergies: [],
    priorTests: [
      {
        id: "pt5",
        testName: "TSH",
        date: "2024-09-10",
        daysAgo: 84,
        facility: "This hospital",
        source: "This hospital",
        category: "Labs",
        result: "2.1 mIU/L",
        report: {
          impression: "Normal thyroid function",
          keyFindings: [
            "TSH within normal range",
            "No evidence of thyroid dysfunction",
          ],
        },
      },
    ],
  },
];

export const initialAuditLog: AuditEntry[] = [
  {
    id: "audit-1",
    timestamp: "2025-01-05T09:30:00",
    user: "Dr. Demo",
    patientId: "p1",
    patientName: "Maria Gonzalez",
    testName: "CT Chest with Contrast",
    action: "cancelled",
    reason: "Using prior result",
  },
  {
    id: "audit-2",
    timestamp: "2025-01-04T14:20:00",
    user: "Dr. Demo",
    patientId: "p2",
    patientName: "James Carter",
    testName: "Lipid Panel",
    action: "ordered",
    reason: "Outside duplicate window - informational only",
  },
  {
    id: "audit-3",
    timestamp: "2025-01-03T11:45:00",
    user: "Dr. Demo",
    patientId: "p3",
    patientName: "Aisha Khan",
    testName: "CBC",
    action: "ordered",
    reason: "No prior test found",
  },
];

export const initialAlerts: AlertRecord[] = [
  {
    id: "alert-1",
    date: "2025-01-05T09:30:00",
    patientId: "p1",
    patientName: "Maria Gonzalez",
    testName: "CT Chest with Contrast",
    type: "duplicate",
    outcome: "cancelled",
  },
  {
    id: "alert-2",
    date: "2025-01-02T10:15:00",
    patientId: "p2",
    patientName: "James Carter",
    testName: "MRI Brain",
    type: "duplicate",
    outcome: "overridden",
  },
  {
    id: "alert-3",
    date: "2024-12-28T15:00:00",
    patientId: "p1",
    patientName: "Maria Gonzalez",
    testName: "Chest X-Ray",
    type: "duplicate",
    outcome: "modified",
  },
];

/**
 * Validates a synthetic patient number: format PS-NNNN-NNNN-NN, last digit is a Luhn check digit.
 * Prototype only. Real systems would use an enterprise master patient index.
 */
export function isValidPatientUid(uid: string): boolean {
  const m = /^PS-(\d{4})-(\d{4})-(\d{2})$/.exec(uid);
  if (!m) return false;
  const digits = (m[1] + m[2] + m[3]).split("").reverse();
  let sum = 0;
  digits.forEach((d, i) => {
    let n = Number(d);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  });
  return sum % 10 === 0;
}

/**
 * Match rules (illustrative, need clinical validation):
 * - Same test name always matches.
 * - Imaging also matches on same modality AND same body region (e.g. CT Chest vs CT Chest with Contrast).
 * - Labs match only on same test name. Never on body region, since every lab is "Blood".
 * Returns the match inside the window, null if only an older match exists (info only), undefined if none.
 */
export function checkForDuplicate(
  patient: Patient,
  test: TestDefinition
): Patient["priorTests"][0] | null | undefined {
  const window = duplicateWindows[test.category];

  const matches = (prior: Patient["priorTests"][0]) => {
    if (prior.testName === test.name) return true;
    if (test.category !== "Imaging" || prior.category !== "Imaging") return false;
    const priorDef = testCatalog.find((t) => t.name === prior.testName);
    return !!priorDef && priorDef.modality === test.modality && priorDef.bodyRegion === test.bodyRegion;
  };

  const match = patient.priorTests.find((prior) => matches(prior) && prior.daysAgo <= window);
  if (match) return match;
  const outsideWindow = patient.priorTests.find((prior) => matches(prior) && prior.daysAgo > window);
  return outsideWindow ? null : undefined;
}