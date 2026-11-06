"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-border">
      <div className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{(currentPage - 1) * pagination.limit + 1}</span> to{" "}
        <span className="font-semibold text-foreground">
          {Math.min(currentPage * pagination.limit, totalItems)}
        </span>{" "}
        of <span className="font-semibold text-foreground">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={!hasPrevPage}
          className="gap-1 text-xs h-8"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((p, index, array) => {
              const showEllipsis = index > 0 && p - array[index - 1] > 1;
              return (
                <div key={p} className="flex items-center">
                  {showEllipsis && (
                    <span className="px-1.5 text-xs text-muted-foreground">...</span>
                  )}
                  <Button
                    variant={p === currentPage ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => navigateToPage(p)}
                    className="text-xs"
                  >
                    {p}
                  </Button>
                </div>
              );
            })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={!hasNextPage}
          className="gap-1 text-xs h-8"
        >
          Next
          <IconChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
