import type { User, School } from './common';

// lib/types/thousand-stories-visit.ts
export interface ThousandStoriesVisit {
    id: number;
    mentor: User;
    school: School;
    visit_date: string;
    library_neat_and_tidy: boolean;
    tracking_sheets_up_to_date: boolean;
    book_boxes_and_borrowing: boolean;
    daily_target_met: boolean;
    story_time_quality: number;
    other_comments?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface CreateThousandStoriesVisitData {
    school_id: number;
    visit_date: string;
    library_neat_and_tidy: boolean;
    tracking_sheets_up_to_date: boolean;
    book_boxes_and_borrowing: boolean;
    daily_target_met: boolean;
    story_time_quality: number;
    other_comments?: string;
  }