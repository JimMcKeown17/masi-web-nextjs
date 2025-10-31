import type { User, School } from './common';

// lib/types/numeracy-visit.ts
export interface NumeracyVisit {
    id: number;
    mentor: User;
    school: School;
    visit_date: string;
    numeracy_tracker_correct: boolean;
    teaching_counting: boolean;
    teaching_number_concepts: boolean;
    teaching_patterns: boolean;
    teaching_addition_subtraction: boolean;
    quality_rating: number;
    supplies_needed?: string;
    commentary?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface CreateNumeracyVisitData {
    school_id: number;
    visit_date: string;
    numeracy_tracker_correct: boolean;
    teaching_counting: boolean;
    teaching_number_concepts: boolean;
    teaching_patterns: boolean;
    teaching_addition_subtraction: boolean;
    quality_rating: number;
    supplies_needed?: string;
    commentary?: string;
  }