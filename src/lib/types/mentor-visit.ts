import type { User, School } from './common';

// lib/types/mentor-visit.ts
export interface MentorVisit {
    id: number;
    mentor: User;
    school: School;
    visit_date: string;
    letter_trackers_correct: boolean;
    reading_trackers_correct: boolean;
    sessions_correct: boolean;
    admin_correct: boolean;
    quality_rating: number;
    supplies_needed?: string;
    commentary?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface MentorVisitFilters {
    time_filter?: '7days' | '30days' | '90days' | 'thisyear' | 'all';
    school?: string;
    mentor?: string;
  }
  
  export interface CreateMentorVisitData {
    school_id: number;
    visit_date: string;
    letter_trackers_correct: boolean;
    reading_trackers_correct: boolean;
    sessions_correct: boolean;
    admin_correct: boolean;
    quality_rating: number;
    supplies_needed?: string;
    commentary?: string;
  }