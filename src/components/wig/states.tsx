import { AlertTriangle } from "lucide-react";

export function WigError({ message }: { message?: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-amber-800 max-w-2xl">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <div>
        <span className="font-semibold">Couldn&apos;t load the WIG board.</span>{" "}
        {message || "Try again shortly."} If the backend WIG endpoints aren&apos;t deployed yet,
        that&apos;s expected.
      </div>
    </div>
  );
}

export function WigSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-56 rounded-lg bg-[#ececec] mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 rounded-2xl bg-white border border-[#f1f1f1]" />
        ))}
      </div>
    </div>
  );
}
