// lib/types/visit-frequency.ts
export interface VisitFrequencyData {
  time_period: string;
  literacy_visits: number;
  yebo_visits: number;
  stories_visits: number;
  numeracy_visits: number;
}

export interface VisitFrequencyResponse {
  data: VisitFrequencyData[];
}

