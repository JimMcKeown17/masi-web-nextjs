import type { User, School } from './common';

// lib/types/yebo-visit.ts
export interface YeboVisit {
    id: number;
    mentor: User;
    school: School;
    visit_date: string;
    paired_reading_took_place: boolean;
    paired_reading_tracking_updated: boolean;
    afternoon_session_quality: number;
    commentary?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface CreateYeboVisitData {
    school_id: number;
    visit_date: string;
    paired_reading_took_place: boolean;
    paired_reading_tracking_updated: boolean;
    afternoon_session_quality: number;
    commentary?: string;
  }