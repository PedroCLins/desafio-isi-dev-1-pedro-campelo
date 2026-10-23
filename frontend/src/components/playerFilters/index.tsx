"use client";

import * as React from "react";
import {
  ChevronDown,
  Coins,
  HeartPulse,
  Search,
  Shield,
  Shirt,
  UserRound,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Club, Condition, ListPlayersParams, Position } from "@/lib/types";

export type PlayerFiltersValue = Omit<ListPlayersParams, "search"> & {
  search: string;
};

type PlayerFiltersProps = {
  clubs: Club[];
  value?: Partial<PlayerFiltersValue>;
  onChange?: (filters: PlayerFiltersValue) => void;
  clubDisabled?: boolean;
};

const positions: Array<{ value: Position; label: string }> = [
  { value: "GOL", label: "Goleiro" },
  { value: "ZAG", label: "Zagueiro" },
  { value: "LAT", label: "Lateral" },
  { value: "MEI", label: "Meio-campo" },
  { value: "ATA", label: "Atacante" },
];

const conditions: Array<{ value: Condition; label: string }> = [
  { value: "APTO", label: "Apto" },
  { value: "MAL_CONDICIONADO", label: "Mal condicionado" },
  { value: "DOENTE", label: "Doente" },
];

const emptyFilters: PlayerFiltersValue = { search: "" };

function formatNumber(value: number) {
  return value.toFixed(2).replace(".", ",");
}

function formatRange(minimum: number | undefined, maximum: number | undefined, format: (value: number) => string) {
  if (minimum !== undefined && maximum !== undefined) {
    return `${format(minimum)} a ${format(maximum)}`;
  }
  if (minimum !== undefined) return `a partir de ${format(minimum)}`;
  return `até ${format(maximum ?? 0)}`;
}

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-muted px-2 py-0.5 pl-2.5 text-[12px] font-medium text-foreground">
      <span>{label}</span>
      <button
        aria-label={`Remover filtro ${label}`}
        className="flex size-5 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-background/80"
        onClick={onRemove}
        type="button"
      >
        <X className="size-4" />
      </button>
    </span>
  );
}

function RangeFilter({
  label,
  icon,
  min,
  max,
  minimum,
  maximum,
  onChange,
  formatValue = String,
}: {
  label: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  minimum?: number;
  maximum?: number;
  onChange: (minimum?: number, maximum?: number) => void;
  formatValue?: (value: number) => string;
}) {
  const [open, setOpen] = React.useState(false);
  const [draftMinimum, setDraftMinimum] = React.useState(minimum?.toString() ?? "");
  const [draftMaximum, setDraftMaximum] = React.useState(maximum?.toString() ?? "");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Keep draft values aligned when a parent changes the applied range.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftMinimum(minimum?.toString() ?? "");
    setDraftMaximum(maximum?.toString() ?? "");
  }, [minimum, maximum]);

  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const commit = () => {
    const parsedMinimum = draftMinimum === "" ? undefined : Number(draftMinimum);
    const parsedMaximum = draftMaximum === "" ? undefined : Number(draftMaximum);
    const nextMinimum =
      parsedMinimum === undefined ? undefined : Math.min(max, Math.max(min, parsedMinimum));
    const nextMaximum =
      parsedMaximum === undefined ? undefined : Math.min(max, Math.max(min, parsedMaximum));
    onChange(nextMinimum, nextMaximum);
    setDraftMinimum(nextMinimum?.toString() ?? "");
    setDraftMaximum(nextMaximum?.toString() ?? "");
    setOpen(false);
  };

  const text =
    minimum !== undefined || maximum !== undefined
      ? `${minimum !== undefined ? formatValue(minimum) : `${formatValue(min)}+`} ${
          maximum !== undefined ? `a ${formatValue(maximum)}` : ""
        }`.trim()
      : label;

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-[14px] font-normal text-foreground shadow-xs outline-none transition-colors hover:bg-muted-subtle focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {icon}
        <span className="max-w-[130px] truncate">{text}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-11 right-0 z-50 w-64 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md">
          <div className="mb-3 text-[12px] font-medium text-foreground">{label}</div>
          <div className="flex items-center gap-2">
            <Input
              aria-label={`${label} mínimo`}
              className="h-8 text-[12px]"
              max={max}
              min={min}
              onChange={(event) => setDraftMinimum(event.target.value.replace(/\D/g, ""))}
              placeholder={`Mín. ${min}`}
              type="number"
              value={draftMinimum}
            />
            <span className="text-[12px] text-muted-foreground">a</span>
            <Input
              aria-label={`${label} máximo`}
              className="h-8 text-[12px]"
              max={max}
              min={min}
              onChange={(event) => setDraftMaximum(event.target.value.replace(/\D/g, ""))}
              placeholder={`Máx. ${max}`}
              type="number"
              value={draftMaximum}
            />
          </div>
          <button
            className="mt-3 h-8 w-full rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground hover:bg-primary/90"
            onClick={commit}
            type="button"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}

export function PlayerFilters({ clubs, value, onChange, clubDisabled = false }: PlayerFiltersProps) {
  const [filters, setFilters] = React.useState<PlayerFiltersValue>({
    ...emptyFilters,
    ...value,
  });

  React.useEffect(() => {
    // Support controlled updates from the player list.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters({ ...emptyFilters, ...value });
  }, [value]);

  const update = (patch: Partial<PlayerFiltersValue>) => {
    setFilters((current) => {
      const next = { ...current, ...patch };
      onChange?.(next);
      return next;
    });
  };

  const selectedPosition = positions.find((item) => item.value === filters.position);
  const selectedCondition = conditions.find((item) => item.value === filters.condition);
  const selectedClub = clubs.find((club) => club.id === filters.club_id);
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.position ||
      filters.condition ||
      filters.club_id !== undefined ||
      filters.free ||
      filters.min_age !== undefined ||
      filters.max_age !== undefined ||
      filters.min_value !== undefined ||
      filters.max_value !== undefined,
  );

  const clearFilters = () => {
    const next = { ...emptyFilters };
    setFilters(next);
    onChange?.(next);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex min-h-[54px] w-full items-center gap-2 overflow-x-auto rounded-xl border border-border bg-background p-2 shadow-xs">
        <label className="flex h-9 min-w-[194px] flex-1 items-center gap-2 rounded-lg border border-input bg-background px-3 shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <span className="sr-only">Buscar jogador pelo nome</span>
          <input
            aria-label="Buscar jogador pelo nome"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
            onChange={(event) => update({ search: event.target.value })}
            placeholder="Buscar por nome"
            value={filters.search}
          />
        </label>

        <Select
        onValueChange={(value) => update({ position: value === "ALL" ? undefined : value as Position })}
        value={filters.position ?? "ALL"}
      >
        <SelectTrigger className="w-[125px] shrink-0 border-input bg-background shadow-xs">
          <Shirt className="size-4 text-muted-foreground" />
          <SelectValue placeholder="Posição">
            {selectedPosition?.label ?? "Posição"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Posição</SelectItem>
          {positions.map((position) => (
            <SelectItem key={position.value} value={position.value}>
              {position.label}
            </SelectItem>
          ))}
        </SelectContent>
        </Select>

        <Select
        onValueChange={(value) =>
          update({ condition: value === "ALL" ? undefined : value as Condition })
        }
        value={filters.condition ?? "ALL"}
      >
        <SelectTrigger className="w-[255px] shrink-0 border-input bg-background shadow-xs">
          <HeartPulse className="size-4 text-muted-foreground" />
          <SelectValue placeholder="Condição">
            {selectedCondition ? `Condição: ${selectedCondition.label}` : "Condição"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Condição</SelectItem>
          {conditions.map((condition) => (
            <SelectItem key={condition.value} value={condition.value}>
              {condition.label}
            </SelectItem>
          ))}
        </SelectContent>
        </Select>

        <Select
        onValueChange={(value) => {
          if (value === "ALL") update({ club_id: undefined, free: undefined });
          else if (value === "FREE") update({ club_id: undefined, free: true });
          else update({ club_id: Number(value), free: undefined });
        }}
        disabled={clubDisabled}
        value={filters.free ? "FREE" : filters.club_id?.toString() ?? "ALL"}
      >
        <SelectTrigger className="w-[112px] shrink-0 border-input bg-background shadow-xs">
          <Shield className="size-4 text-muted-foreground" />
          <SelectValue placeholder="Clube">
            {filters.free ? "Livre" : selectedClub?.acronym ?? "Clube"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Clube</SelectItem>
          <SelectItem value="FREE">Livre</SelectItem>
          {clubs.map((club) => (
            <SelectItem key={club.id} value={club.id.toString()}>
              {club.acronym}
            </SelectItem>
          ))}
        </SelectContent>
        </Select>

        <RangeFilter
          icon={<UserRound className="size-4 text-muted-foreground" />}
          label="Idade"
          max={45}
          maximum={filters.max_age}
          min={16}
          minimum={filters.min_age}
          onChange={(minAge, maxAge) => update({ min_age: minAge, max_age: maxAge })}
          formatValue={(age) => String(age)}
        />
        <RangeFilter
          formatValue={formatNumber}
          icon={<Coins className="size-4 text-muted-foreground" />}
          label="Valor"
          max={999999}
          maximum={filters.max_value}
          min={0}
          minimum={filters.min_value}
          onChange={(minValue, maxValue) =>
            update({ min_value: minValue, max_value: maxValue })
          }
        />
      </div>

      {hasActiveFilters && (
        <div className="flex min-h-8 flex-wrap content-center items-center gap-2">
          <span className="text-[14px] leading-5 text-muted-foreground">
            {filters.search ? "Resultados para a busca:" : "Filtros ativos:"}
          </span>
          {filters.search && (
            <ActiveFilterChip
              label={`Busca: ${filters.search}`}
              onRemove={() => update({ search: "" })}
            />
          )}
          {selectedPosition && (
            <ActiveFilterChip
              label={`Posição: ${selectedPosition.label}`}
              onRemove={() => update({ position: undefined })}
            />
          )}
          {selectedCondition && (
            <ActiveFilterChip
              label={`Condição: ${selectedCondition.label}`}
              onRemove={() => update({ condition: undefined })}
            />
          )}
          {(filters.club_id !== undefined || filters.free) && (
            <ActiveFilterChip
              label={`Clube: ${filters.free ? "Livre" : selectedClub?.acronym ?? "Clube"}`}
              onRemove={() => update({ club_id: undefined, free: undefined })}
            />
          )}
          {(filters.min_age !== undefined || filters.max_age !== undefined) && (
            <ActiveFilterChip
              label={`Idade: ${formatRange(filters.min_age, filters.max_age, String)}`}
              onRemove={() => update({ min_age: undefined, max_age: undefined })}
            />
          )}
          {(filters.min_value !== undefined || filters.max_value !== undefined) && (
            <ActiveFilterChip
              label={`Valor de mercado: ${formatRange(filters.min_value, filters.max_value, formatNumber)}`}
              onRemove={() => update({ min_value: undefined, max_value: undefined })}
            />
          )}
          <button
            className="h-8 rounded-lg px-3 text-[14px] font-medium text-primary transition-colors hover:bg-primary/10"
            onClick={clearFilters}
            type="button"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
