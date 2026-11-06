"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [, startTransition] = useTransition();

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
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-xs pl-8 pr-8"
      />
      <IconSearch className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground select-none" />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={clearSearch}
          aria-label="Clear search"
          className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground hover:text-foreground"
        >
          <IconX className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
