// lib/types/visit-form.ts

export type VisitFormType = 'masi_literacy' | 'yebo' | 'thousand_stories' | 'numeracy';

export interface VisitFormBaseData {
  form_type: VisitFormType;
  school_id: number;
  visit_date: Date;
}

// Masi Literacy Program Form Data
export interface MasiLiteracyFormData extends VisitFormBaseData {
  form_type: 'masi_literacy';
  letter_trackers_correct: boolean;
  reading_trackers_correct: boolean;
  sessions_correct: boolean;
  admin_correct: boolean;
  quality_rating?: number | null;
  supplies_needed?: string;
  commentary?: string;
}

// Yebo Program Form Data
export interface YeboFormData extends VisitFormBaseData {
  form_type: 'yebo';
  paired_reading_took_place: boolean;
  paired_reading_tracking_updated: boolean;
  afternoon_session_quality?: number | null;
  commentary?: string;
}

// 1000 Stories Program Form Data
export interface ThousandStoriesFormData extends VisitFormBaseData {
  form_type: 'thousand_stories';
  library_neat_and_tidy: boolean;
  tracking_sheets_up_to_date: boolean;
  book_boxes_and_borrowing: boolean;
  daily_target_met: boolean;
  story_time_quality?: number | null;
  other_comments?: string;
}

// Numeracy Program Form Data
export interface NumeracyFormData extends VisitFormBaseData {
  form_type: 'numeracy';
  numeracy_tracker_correct: boolean;
  teaching_counting: boolean;
  teaching_number_concepts: boolean;
  teaching_patterns: boolean;
  teaching_addition_subtraction: boolean;
  quality_rating?: number | null;
  supplies_needed?: string;
  commentary?: string;
}

// Discriminated union of all visit form types
export type VisitFormData =
  | MasiLiteracyFormData
  | YeboFormData
  | ThousandStoriesFormData
  | NumeracyFormData;

// Form labels for display
export const VISIT_FORM_LABELS: Record<VisitFormType, string> = {
  masi_literacy: 'Masi Literacy',
  yebo: 'Yebo',
  thousand_stories: '1000 Stories',
  numeracy: 'Numeracy',
};

// Quality rating options (1-10)
export const QUALITY_RATING_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}`,
}));
