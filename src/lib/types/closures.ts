// Types for the closure-calendar API (Masi backend, ADMIN / PROJECT MANAGER).

export type ClosureScopeType = "global" | "type" | "region" | "school";
export type ClosureSource = "manual" | "public_holiday";
export type AbsenceReason = "vacation" | "funeral" | "sick" | "other";

export interface SchoolClosure {
  id: number;
  date: string; // ISO yyyy-mm-dd
  scope_type: ClosureScopeType;
  scope_key: string;
  scope_display: string;
  scope_school: number | null;
  scope_school_type: string | null;
  scope_region: string | null;
  is_open: boolean;
  source: ClosureSource;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface StaffAbsence {
  id: number;
  date: string;
  youth: number | null;
  youth_uid: string;
  youth_name: string;
  reason: AbsenceReason;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface ClosureLookups {
  schools: { school_uid: string; name: string; suburb: string | null; canonical_type: string }[];
  suburbs: string[];
  school_types: { value: string; label: string }[];
  youth: { youth_uid: string; name: string }[];
}

export interface ClosureBulkBody {
  date_from: string;
  date_to: string;
  scope_type: ClosureScopeType;
  scope_values?: (string | null)[];
  is_open?: boolean;
  reason?: string;
}

export interface AbsenceBulkBody {
  youth_uids: string[];
  date_from: string;
  date_to: string;
  reason?: AbsenceReason;
  note?: string;
}
