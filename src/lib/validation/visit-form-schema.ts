// lib/validation/visit-form-schema.ts

import { z } from 'zod';

// Base schema for common fields across all visit forms
const visitFormBaseSchema = z.object({
  school_id: z.number().int().positive('Please select a school'),
  visit_date: z.date().max(new Date(), 'Visit date cannot be in the future'),
});

// Quality rating schema - optional, but must be 1-10 if provided
const qualityRatingSchema = z
  .number()
  .int()
  .min(1, 'Rating must be at least 1')
  .max(10, 'Rating must be at most 10')
  .nullable()
  .optional();

// Text field schemas with character limits
const suppliesNeededSchema = z
  .string()
  .max(500, 'Supplies needed must be 500 characters or less')
  .optional()
  .or(z.literal(''));

const commentarySchema = z
  .string()
  .max(1000, 'Commentary must be 1000 characters or less')
  .optional()
  .or(z.literal(''));

// Masi Literacy Program Form Schema
export const masiLiteracyFormSchema = visitFormBaseSchema.extend({
  form_type: z.literal('masi_literacy'),
  letter_trackers_correct: z.boolean(),
  reading_trackers_correct: z.boolean(),
  sessions_correct: z.boolean(),
  admin_correct: z.boolean(),
  quality_rating: qualityRatingSchema,
  supplies_needed: suppliesNeededSchema,
  commentary: commentarySchema,
});

// Yebo Program Form Schema
export const yeboFormSchema = visitFormBaseSchema.extend({
  form_type: z.literal('yebo'),
  paired_reading_took_place: z.boolean(),
  paired_reading_tracking_updated: z.boolean(),
  afternoon_session_quality: qualityRatingSchema,
  commentary: commentarySchema,
});

// 1000 Stories Program Form Schema
export const thousandStoriesFormSchema = visitFormBaseSchema.extend({
  form_type: z.literal('thousand_stories'),
  library_neat_and_tidy: z.boolean(),
  tracking_sheets_up_to_date: z.boolean(),
  book_boxes_and_borrowing: z.boolean(),
  daily_target_met: z.boolean(),
  story_time_quality: qualityRatingSchema,
  other_comments: commentarySchema,
});

// Numeracy Program Form Schema
export const numeracyFormSchema = visitFormBaseSchema.extend({
  form_type: z.literal('numeracy'),
  numeracy_tracker_correct: z.boolean(),
  teaching_counting: z.boolean(),
  teaching_number_concepts: z.boolean(),
  teaching_patterns: z.boolean(),
  teaching_addition_subtraction: z.boolean(),
  quality_rating: qualityRatingSchema,
  supplies_needed: suppliesNeededSchema,
  commentary: commentarySchema,
});

// Discriminated union schema for all visit form types
export const visitFormSchema = z.discriminatedUnion('form_type', [
  masiLiteracyFormSchema,
  yeboFormSchema,
  thousandStoriesFormSchema,
  numeracyFormSchema,
]);

// Infer TypeScript types from schemas
export type MasiLiteracyFormSchema = z.infer<typeof masiLiteracyFormSchema>;
export type YeboFormSchema = z.infer<typeof yeboFormSchema>;
export type ThousandStoriesFormSchema = z.infer<typeof thousandStoriesFormSchema>;
export type NumeracyFormSchema = z.infer<typeof numeracyFormSchema>;
export type VisitFormSchema = z.infer<typeof visitFormSchema>;
