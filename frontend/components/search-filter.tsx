"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";

interface SearchFilterProps {
  placeholder?: string;
  paramKey?: string;
}

export function SearchFilter({
  placeholder = "Search...",
  paramKey = "search"
}: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get(paramKey) || "";
  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (term.trim()) {
        params.set(paramKey, term.trim());
      } else {
        params.delete(paramKey);
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearSearch = () => {
    handleSearch("");
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
        <IconSearch className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-muted bg-card py-2 pl-9 pr-9 text-xs text-primary placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-primary"
          aria-label="Clear search"
        >
          <IconX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

