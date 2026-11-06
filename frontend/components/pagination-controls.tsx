"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/lib/types";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface PaginationControlsProps {
  pagination?: Pagination;
}

export function PaginationControls({ pagination }: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { currentPage, totalPages, totalItems, hasPrevPage, hasNextPage } = pagination;

  const navigateToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-muted">
      <div className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-primary">{(currentPage - 1) * pagination.limit + 1}</span> to{" "}
        <span className="font-semibold text-primary">
          {Math.min(currentPage * pagination.limit, totalItems)}
        </span>{" "}
        of <span className="font-semibold text-primary">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={!hasPrevPage}
          className="inline-flex items-center gap-1 rounded-lg border border-muted bg-card px-3 py-1.5 text-xs font-medium text-primary hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <IconChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((p, index, array) => {
              const showEllipsis = index > 0 && p - array[index - 1] > 1;
              return (
                <div key={p} className="flex items-center">
                  {showEllipsis && (
                    <span className="px-2 text-xs text-muted-foreground">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => navigateToPage(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                      p === currentPage
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "border border-muted bg-card text-primary hover:bg-secondary"
                    }`}
                  >
                    {p}
                  </button>
                </div>
              );
            })}
        </div>

        <button
          type="button"
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={!hasNextPage}
          className="inline-flex items-center gap-1 rounded-lg border border-muted bg-card px-3 py-1.5 text-xs font-medium text-primary hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          Next
          <IconChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

