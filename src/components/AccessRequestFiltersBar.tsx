import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACCESS_REQUEST_STATUS_LABELS,
  accessRequestStatusSchema,
  type AccessRequestStatus,
} from "@/schemas/accessRequests";

/** Filters as typed in the bar ("" = all statuses). */
export interface AccessRequestFiltersValue {
  status: AccessRequestStatus | "";
  q: string;
}

interface AccessRequestFiltersBarProps {
  value: AccessRequestFiltersValue;
  onChange: (value: AccessRequestFiltersValue) => void;
}

// Radix Select forbids an item with an empty value: "all statuses" goes
// through a sentinel that is mapped back to "" in the filters value.
const ALL_STATUSES = "ALL";

export function AccessRequestFiltersBar({ value, onChange }: AccessRequestFiltersBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Label htmlFor="filter-q" className="sr-only">
        Rechercher un demandeur
      </Label>
      <div className="relative">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="filter-q"
          type="search"
          placeholder="Rechercher un demandeur…"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          className="w-64 bg-card pl-8"
        />
      </div>

      <Select
        value={value.status === "" ? ALL_STATUSES : value.status}
        onValueChange={(selected) => {
          const parsed = accessRequestStatusSchema.safeParse(selected);
          onChange({ ...value, status: parsed.success ? parsed.data : "" });
        }}
      >
        <SelectTrigger className="bg-card" aria-label="Filtrer par statut">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATUSES}>Tous les statuts</SelectItem>
          {accessRequestStatusSchema.options.map((status) => (
            <SelectItem key={status} value={status}>
              {ACCESS_REQUEST_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
