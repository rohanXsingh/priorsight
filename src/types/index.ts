export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: string;
  mrn: string;
  allergies: string[];
  priorTests: PriorTest[];
}

export interface PriorTest {
  id: string;
  testName: string;
  date: string;
  daysAgo: number;
  facility: string;
  source: "External" | "This hospital";
  category: "Imaging" | "Labs";
  result: string;
  report: {
    impression: string;
    keyFindings: string[];
  };
}

export interface TestDefinition {
  id: string;
  name: string;
  category: "Imaging" | "Labs";
  bodyRegion: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  patientId: string;
  patientName: string;
  testName: string;
  action: "ordered" | "cancelled" | "overridden" | "modified";
  reason: string;
}

export interface AlertRecord {
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  testName: string;
  type: "duplicate";
  outcome: "pending" | "cancelled" | "overridden" | "modified";
}