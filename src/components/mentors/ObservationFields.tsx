"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface ObservationFieldsProps {
  form: any;
  checkboxFields?: Array<{
    name: string;
    label: string;
  }>;
  qualityRatingField?: {
    name: string;
    label: string;
  };
  commentaryField?: {
    name: string;
    label: string;
    maxLength?: number;
  };
  showCheckboxes?: boolean;
  showQualityRating?: boolean;
  showCommentary?: boolean;
}

/**
 * Reusable component for observation-related fields in visit forms.
 * Includes checkboxes for observations, quality rating slider, and commentary.
 */
export function ObservationFields({
  form,
  checkboxFields = [],
  qualityRatingField,
  commentaryField = { name: 'commentary', label: 'Commentary (Optional)', maxLength: 1000 },
  showCheckboxes = true,
  showQualityRating = true,
  showCommentary = true,
}: ObservationFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Checkboxes */}
      {showCheckboxes && checkboxFields.length > 0 && (
        <div className="grid grid-cols-2 gap-4 pb-4">
          {checkboxFields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={formField.value}
                      onCheckedChange={formField.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{field.label}</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          ))}
        </div>
      )}

      {/* Quality Rating Slider */}
      {showQualityRating && qualityRatingField && (
        <FormField
          control={form.control}
          name={qualityRatingField.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{qualityRatingField.label} (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={field.value ? [field.value] : [5]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>1 - Poor</span>
                    <span>5 - Average</span>
                    <span>10 - Excellent</span>
                  </div>
                  <div className="text-center text-sm font-medium">
                    {field.value ? `Rating: ${field.value}` : 'Not rated'}
                  </div>
                  <div className="text-xs text-slate-500 text-center">
                    Leave unset if you cannot rate the session quality
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Commentary */}
      {showCommentary && (
        <FormField
          control={form.control}
          name={commentaryField.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{commentaryField.label}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} className="rounded-xl resize-none" />
              </FormControl>
              <div className="flex justify-between">
                <FormMessage />
                <span className="text-xs text-slate-500">
                  {field.value?.length || 0} / {commentaryField.maxLength || 1000}
                </span>
              </div>
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
