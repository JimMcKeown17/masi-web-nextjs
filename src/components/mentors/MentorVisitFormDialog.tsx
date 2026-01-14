"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@clerk/nextjs';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';

import {
  VisitFormType,
  VisitFormData,
  VISIT_FORM_LABELS,
} from '@/lib/types/visit-form';
import type { School } from '@/lib/types';
import {
  masiLiteracyFormSchema,
  yeboFormSchema,
  thousandStoriesFormSchema,
  numeracyFormSchema,
} from '@/lib/validation/visit-form-schema';
import { createMentorVisit } from '@/lib/api/mentors/mentor-visits';
import { createYeboVisit } from '@/lib/api/mentors/yebo-visits';
import { createThousandStoriesVisit } from '@/lib/api/mentors/thousand-stories-visits';
import { createNumeracyVisit } from '@/lib/api/mentors/numeracy-visits';
import { ObservationFields } from '@/components/mentors/ObservationFields';
import { cn } from '@/lib/utils';

interface MentorVisitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schools: School[];
  onSuccess?: () => void;
}

export function MentorVisitFormDialog({
  open,
  onOpenChange,
  schools,
  onSuccess,
}: MentorVisitFormDialogProps) {
  const { getToken } = useAuth();
  const [formType, setFormType] = useState<VisitFormType>('masi_literacy');
  const [visitType, setVisitType] = useState<'observation' | 'meeting' | 'delivery' | 'other'>('observation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the appropriate schema based on form type
  const getSchema = () => {
    switch (formType) {
      case 'masi_literacy':
        return masiLiteracyFormSchema;
      case 'yebo':
        return yeboFormSchema;
      case 'thousand_stories':
        return thousandStoriesFormSchema;
      case 'numeracy':
        return numeracyFormSchema;
    }
  };

  // Get default values for each form type
  const getDefaultValues = (type: VisitFormType) => {
    const baseDefaults = {
      form_type: type,
      school_id: undefined,
      visit_date: new Date(),
      visit_type: visitType,
    };

    switch (type) {
      case 'masi_literacy':
        return {
          ...baseDefaults,
          letter_trackers_correct: null,
          reading_trackers_correct: null,
          sessions_correct: null,
          admin_correct: null,
          quality_rating: null,
          supplies_needed: '',
          commentary: '',
        };
      case 'yebo':
        return {
          ...baseDefaults,
          paired_reading_took_place: false,
          paired_reading_tracking_updated: false,
          afternoon_session_quality: null,
          after_school_observation: '',
          paired_reading_observation: '',
          commentary: '',
        };
      case 'thousand_stories':
        return {
          ...baseDefaults,
          library_neat_and_tidy: false,
          tracking_sheets_up_to_date: false,
          book_boxes_and_borrowing: false,
          daily_target_met: false,
          story_time_quality: null,
          other_comments: '',
        };
      case 'numeracy':
        return {
          ...baseDefaults,
          numeracy_tracker_correct: false,
          teaching_counting: false,
          teaching_number_concepts: false,
          teaching_patterns: false,
          teaching_addition_subtraction: false,
          quality_rating: null,
          supplies_needed: '',
          commentary: '',
        };
    }
  };

  // Use any to avoid TypeScript issues with discriminated unions in react-hook-form
  // Validation is still handled by Zod at runtime
  const form = useForm<any>({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(formType),
  });

  // Reset form when form type or visit type changes
  useEffect(() => {
    const currentSchoolId = form.getValues('school_id');
    const currentVisitDate = form.getValues('visit_date');

    const newDefaults = getDefaultValues(formType);
    form.reset({
      ...newDefaults,
      school_id: currentSchoolId,
      visit_date: currentVisitDate || new Date(),
      visit_type: visitType,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formType, visitType]);

  const onSubmit = async (data: VisitFormData) => {
    try {
      setIsSubmitting(true);
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required. Please sign in again.');
        return;
      }

      // Convert date to YYYY-MM-DD format and remove form_type (not needed by API)
      const { form_type, visit_date, ...rest } = data;
      const submitData = {
        ...rest,
        visit_date: format(visit_date, 'yyyy-MM-dd'),
      };

      // Route to correct API endpoint based on form type
      switch (form_type) {
        case 'masi_literacy':
          await createMentorVisit(token, submitData as any);
          break;
        case 'yebo':
          await createYeboVisit(token, submitData as any);
          break;
        case 'thousand_stories':
          await createThousandStoriesVisit(token, submitData as any);
          break;
        case 'numeracy':
          await createNumeracyVisit(token, submitData as any);
          break;
      }

      toast.success('Visit report submitted successfully!');
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting visit report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to submit: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-blue-500 to-blue-600 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <DialogTitle className="text-2xl text-white">
            School Visit Report
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Program Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="form-type-select">Program Type</Label>
              <Select
                value={formType}
                onValueChange={(value) => setFormType(value as VisitFormType)}
              >
                <SelectTrigger id="form-type-select" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VISIT_FORM_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* School Selector */}
            <FormField
              control={form.control}
              name="school_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select a school" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id.toString()}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Picker */}
            <FormField
              control={form.control}
              name="visit_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Visit Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'rounded-xl pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(23, 59, 59, 999);
                          return date > today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visit Type Selector - only show for Masi Literacy */}
            {formType === 'masi_literacy' && (
              <div className="space-y-2">
                <Label htmlFor="visit-type-select">Type of Visit</Label>
                <Select
                  value={visitType}
                  onValueChange={(value) => setVisitType(value as any)}
                >
                  <SelectTrigger id="visit-type-select" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="observation">Observation</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dynamic Fields Based on Form Type */}
            {formType === 'masi_literacy' && (
              <>
                {visitType === 'observation' ? (
                  <ObservationFields
                    form={form}
                    checkboxFields={[
                      { name: 'letter_trackers_correct', label: 'Letter trackers correct' },
                      { name: 'reading_trackers_correct', label: 'Reading trackers correct' },
                      { name: 'sessions_correct', label: 'Sessions correct' },
                      { name: 'admin_correct', label: 'Admin correct' },
                    ]}
                    qualityRatingField={{
                      name: 'quality_rating',
                      label: 'Quality of Sessions Observed',
                    }}
                    commentaryField={{
                      name: 'commentary',
                      label: 'Commentary (Optional)',
                      maxLength: 1000,
                    }}
                  />
                ) : (
                  <ObservationFields
                    form={form}
                    checkboxFields={[]}
                    showCheckboxes={false}
                    showQualityRating={false}
                    commentaryField={{
                      name: 'commentary',
                      label: 'Commentary',
                      maxLength: 1000,
                    }}
                  />
                )}
              </>
            )}
            {formType === 'yebo' && <YeboFields form={form} />}
            {formType === 'thousand_stories' && (
              <ThousandStoriesFields form={form} />
            )}
            {formType === 'numeracy' && <NumeracyFields form={form} />}

            {/* Submit/Cancel Buttons */}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Component for Masi Literacy specific fields
function MasiLiteracyFields({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="letter_trackers_correct"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Letter trackers correct</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reading_trackers_correct"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Reading trackers correct</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sessions_correct"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Sessions correct</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="admin_correct"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Admin correct</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>

      <QualityRatingField form={form} name="quality_rating" label="Quality of Sessions Observed" />

      <FormField
        control={form.control}
        name="supplies_needed"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Supplies Needed (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} className="rounded-xl resize-none" />
            </FormControl>
            <div className="flex justify-between">
              <FormMessage />
              <span className="text-xs text-slate-500">
                {field.value?.length || 0} / 500
              </span>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="commentary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Commentary (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} className="rounded-xl resize-none" />
            </FormControl>
            <div className="flex justify-between">
              <FormMessage />
              <span className="text-xs text-slate-500">
                {field.value?.length || 0} / 1000
              </span>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}

// Component for Yebo specific fields
function YeboFields({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="paired_reading_took_place"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Paired reading took place</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paired_reading_tracking_updated"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Paired reading tracking updated</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>

      <QualityRatingField
        form={form}
        name="afternoon_session_quality"
        label="Afternoon Session Quality"
      />

      <FormField
        control={form.control}
        name="after_school_observation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>After-School Observation (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} className="rounded-xl resize-none" />
            </FormControl>
            <div className="flex justify-between">
              <FormMessage />
              <span className="text-xs text-slate-500">
                {field.value?.length || 0} / 1000
              </span>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="paired_reading_observation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Paired Reading Observation (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} className="rounded-xl resize-none" />
            </FormControl>
            <div className="flex justify-between">
              <FormMessage />
              <span className="text-xs text-slate-500">
                {field.value?.length || 0} / 1000
              </span>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="commentary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Commentary (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} className="rounded-xl resize-none" />
            </FormControl>
            <div className="flex justify-between">
              <FormMessage />
              <span className="text-xs text-slate-500">
                {field.value?.length || 0} / 1000
              </span>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}

// Component for 1000 Stories specific fields
function ThousandStoriesFields({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="library_neat_and_tidy"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Library neat and tidy</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tracking_sheets_up_to_date"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Tracking sheets up to date</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="book_boxes_and_borrowing"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Book boxes and borrowing</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="daily_target_met"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Daily target met</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>

      <QualityRatingField
        form={form}
        name="story_time_quality"
        label="Story Time Session Quality"
      />

      <FormField
        control={form.control}
        name="other_comments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Other Comments (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} className="rounded-xl resize-none" />
            </FormControl>
            <div className="flex justify-between">
              <FormMessage />
              <span className="text-xs text-slate-500">
                {field.value?.length || 0} / 1000
              </span>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}

// Component for Numeracy specific fields
function NumeracyFields({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="numeracy_tracker_correct"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Numeracy tracker correct</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teaching_counting"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Teaching counting</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teaching_number_concepts"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Teaching number concepts</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teaching_patterns"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Teaching patterns</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teaching_addition_subtraction"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 col-span-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Teaching addition/subtraction</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>

      <QualityRatingField form={form} name="quality_rating" label="Quality of Sessions Observed" />

      <FormField
        control={form.control}
        name="supplies_needed"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Supplies Needed (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} className="rounded-xl resize-none" />
            </FormControl>
            <div className="flex justify-between">
              <FormMessage />
              <span className="text-xs text-slate-500">
                {field.value?.length || 0} / 500
              </span>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="commentary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Commentary (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} rows={4} className="rounded-xl resize-none" />
            </FormControl>
            <div className="flex justify-between">
              <FormMessage />
              <span className="text-xs text-slate-500">
                {field.value?.length || 0} / 1000
              </span>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}

// Reusable Quality Rating Slider Component
function QualityRatingField({
  form,
  name,
  label,
}: {
  form: any;
  name: string;
  label: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label} (Optional)</FormLabel>
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
  );
}
