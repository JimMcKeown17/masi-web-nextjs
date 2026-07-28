import { Badge } from "@/components/ui/badge";
import type { YouthBudgetNotes } from "@/lib/types/youth-budget";

export function NotesStrip({ notes }: { notes: YouthBudgetNotes }) {
  return (
    <section
      aria-label="Projection provenance"
      className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed bg-muted/25 px-4 py-3"
    >
      <span className="mr-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Population checks
      </span>
      <Badge variant="outline" className="bg-white">
        {notes.active_total} active youth in source
      </Badge>
      <Badge variant="outline" className="bg-white">
        {notes.school_less} without a school
      </Badge>
      <Badge variant="outline" className="bg-white">
        {notes.yebo_shown_only} Yebo shown, not costed
      </Badge>
    </section>
  );
}
