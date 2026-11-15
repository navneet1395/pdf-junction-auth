import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface ComboboxFieldProps {
  id: string;
  label: React.ReactNode;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  /** Small helper line under the control (e.g. data source / freshness). */
  hint?: React.ReactNode;
  required?: boolean;
}

/**
 * Searchable dropdown that always accepts a typed custom value, so it degrades
 * to a plain text field when no options are available.
 */
export function ComboboxField({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Select or type…",
  searchPlaceholder = "Type to search…",
  loading = false,
  disabled = false,
  error,
  hint,
  required,
}: ComboboxFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const trimmed = search.trim();
  const hasExact = options.some((o) => o.localeCompare(trimmed, undefined, { sensitivity: "accent" }) === 0);

  const select = (v: string) => {
    onChange(v);
    setSearch("");
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={!!error}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground",
              error && "border-red-500",
            )}
          >
            <span className="truncate">{value || placeholder}</span>
            {loading ? (
              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>{options.length ? "No match." : "No suggestions – type a value."}</CommandEmpty>
              {trimmed && !hasExact && (
                <CommandGroup heading="Custom">
                  <CommandItem value={`__custom__${trimmed}`} onSelect={() => select(trimmed)}>
                    Use “{trimmed}”
                  </CommandItem>
                </CommandGroup>
              )}
              {options.length > 0 && (
                <CommandGroup heading={options.length > 1 ? `${options.length} options` : undefined}>
                  {options.map((opt) => (
                    <CommandItem key={opt} value={opt} onSelect={() => select(opt)}>
                      <Check className={cn("mr-2 h-4 w-4", value === opt ? "opacity-100" : "opacity-0")} />
                      {opt}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export default ComboboxField;
