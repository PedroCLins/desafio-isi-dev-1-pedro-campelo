"use client";

import { ArrowUpDown, ChevronRight, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { Club, ClubSort } from "@/lib/types";

type ClubsTableProps = {
  clubs: Club[];
  sort?: ClubSort;
  onSortChange?: (sort: ClubSort) => void;
  onViewClub?: (club: Club) => void;
};

const sortOptions: Array<{ value: ClubSort; label: string }> = [
  { value: "name", label: "Nome" },
  { value: "net_worth_desc", label: "Patrimônio (maior para o menor)" },
  { value: "net_worth_asc", label: "Patrimônio (menor para o maior)" },
];

function money(value: number | string) {
  return Number(value).toFixed(2).replace(".", ",");
}

export function ClubsTable({
  clubs,
  sort = "net_worth_desc",
  onSortChange,
  onViewClub,
}: ClubsTableProps) {
  const router = useRouter();
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-3.5">
        <div className="flex items-center gap-2 text-[14px] font-medium">
          <span>{clubs.length} clubes</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[12px] text-muted-foreground">
            {clubs.length} de 20
          </span>
        </div>
        <Select value={sort} onValueChange={(value) => onSortChange?.(value as ClubSort)}>
          <SelectTrigger className="w-[280px]">
            <ArrowUpDown className="size-4" />
            <span className="flex-1 truncate text-left">
              {sortOptions.find((option) => option.value === sort)?.label ?? "Ordenar"}
            </span>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[14px]">
          <thead className="bg-muted-subtle text-left text-[12px] font-medium text-muted-foreground">
            <tr>
              <th className="px-3.5 py-2.5">Clube</th>
              <th className="px-3.5 py-2.5">Sigla</th>
              <th className="px-3.5 py-2.5 text-right">Caixa</th>
              <th className="px-3.5 py-2.5 text-right">Valor do elenco</th>
              <th className="px-3.5 py-2.5 text-right">Patrimônio</th>
              <th className="w-32 px-3.5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {clubs.map((club) => (
              <tr key={club.id} className="border-t border-border">
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-[11px] font-medium text-muted-foreground">
                      <Shield className="hidden size-4" />
                      <span>{club.acronym}</span>
                    </span>
                    <span className="font-medium">{club.name}</span>
                  </div>
                </td>
                <td className="px-3.5 py-2.5">
                  <span className="rounded-md border border-border px-2 py-1 text-[12px] font-medium">
                    {club.acronym}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 text-right">{money(club.cash)}</td>
                <td className="px-3.5 py-2.5 text-right">{money(club.squad_value)}</td>
                <td className="px-3.5 py-2.5 text-right font-semibold">{money(club.net_worth)}</td>
                <td className="px-3.5 py-2.5 text-right">
                  <Button
                    className="gap-1"
                    onClick={() => {
                      onViewClub?.(club);
                      router.push(`/clubes/${club.id}`);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    Ver clube
                    <ChevronRight className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {clubs.length === 0 && (
              <tr>
                <td className="px-3.5 py-10 text-center text-muted-foreground" colSpan={6}>
                  Nenhum clube cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
