import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
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

      <Label htmlFor="filter-status" className="sr-only">
        Filtrer par statut
      </Label>
      <NativeSelect
        id="filter-status"
        className="bg-card"
        value={value.status}
        onChange={(e) => {
          const parsed = accessRequestStatusSchema.safeParse(e.target.value);
          onChange({ ...value, status: parsed.success ? parsed.data : "" });
        }}
      >
        <NativeSelectOption value="">Tous les statuts</NativeSelectOption>
        {accessRequestStatusSchema.options.map((status) => (
          <NativeSelectOption key={status} value={status}>
            {ACCESS_REQUEST_STATUS_LABELS[status]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}
