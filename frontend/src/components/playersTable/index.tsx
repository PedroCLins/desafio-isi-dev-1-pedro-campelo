"use client";

import * as React from "react";
import {
  ArrowUpDown,
  MoreHorizontal,
  ShoppingCart,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Club, PlayerWithValue } from "@/lib/types";

export type PlayersTableTab = "all" | "free" | "clubs";
export type PlayersTableSort =
  | "name"
  | "age_asc"
  | "age_desc"
  | "value_asc"
  | "value_desc"
  | "position";

type PlayersTableProps = {
  players: PlayerWithValue[];
  clubs?: Club[];
  totalItems?: number;
  page?: number;
  totalPages?: number;
  counts?: { all: number; free: number; clubs: number };
  tab?: PlayersTableTab;
  sort?: PlayersTableSort;
  onTabChange?: (tab: PlayersTableTab) => void;
  onSortChange?: (sort: PlayersTableSort) => void;
  onPageChange?: (page: number) => void;
  onDetails?: (player: PlayerWithValue) => void;
  onBuy?: (player: PlayerWithValue) => void;
};

const sortOptions: Array<{ value: PlayersTableSort; label: string }> = [
  { value: "name", label: "nome" },
  { value: "age_asc", label: "idade (menor)" },
  { value: "age_desc", label: "idade (maior)" },
  { value: "value_asc", label: "valor (menor)" },
  { value: "value_desc", label: "valor (maior)" },
  { value: "position", label: "posição" },
];

const conditionLabels = {
  APTO: "Apto",
  MAL_CONDICIONADO: "Mal condicionado",
  DOENTE: "Doente",
} as const;

const conditionVariants = {
  APTO: "success",
  MAL_CONDICIONADO: "warning",
  DOENTE: "destructive",
} as const;

const positionLabels = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  MEI: "Meio-campo",
  ATA: "Atacante",
} as const;

function money(value: number | string) {
  return Number(value).toFixed(2).replace(".", ",");
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function TabLabel({ label, count }: { label: string; count: number }) {
  return (
    <>
      <span>{label}</span>
      <span className="text-muted-foreground">{count}</span>
    </>
  );
}

export function PlayersTable({
  players,
  clubs = [],
  totalItems = players.length,
  page = 1,
  totalPages = 1,
  counts,
  tab = "all",
  sort = "name",
  onTabChange,
  onSortChange,
  onPageChange,
  onDetails,
  onBuy,
}: PlayersTableProps) {
  const freeCount = counts?.free ?? players.filter((player) => player.club_id === null).length;
  const clubCount = counts?.clubs ?? players.filter((player) => player.club_id !== null).length;
  const allCount = counts?.all ?? totalItems;
  const clubMap = new Map(clubs.map((club) => [club.id, club]));
  const firstItem = totalItems === 0 ? 0 : (page - 1) * 10 + 1;
  const lastItem = Math.min(page * 10, totalItems);

  return (
    <section className="w-full overflow-hidden rounded-xl border border-border bg-background shadow-xs">
      <header className="flex h-[61px] items-center justify-between border-b border-border px-4">
        <Tabs
          onValueChange={(value) => onTabChange?.(value as PlayersTableTab)}
          value={tab}
        >
          <TabsList className="h-9 rounded-[10px]">
            <TabsTrigger className="h-[30px] px-2.5" value="all">
              <TabLabel count={allCount} label="Todos" />
            </TabsTrigger>
            <TabsTrigger className="h-[30px] px-2.5" value="free">
              <TabLabel count={freeCount} label="Livres" />
            </TabsTrigger>
            <TabsTrigger className="h-[30px] px-2.5" value="clubs">
              <TabLabel count={clubCount} label="Em clubes" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select onValueChange={(value) => onSortChange?.(value as PlayersTableSort)} value={sort}>
          <SelectTrigger className="w-[169px] border-input shadow-xs">
            <ArrowUpDown className="size-4 text-muted-foreground" />
            <SelectValue>
              Ordenar: {sortOptions.find((option) => option.value === sort)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-[12px]">
          <thead className="bg-muted-subtle text-left text-[12px] font-medium text-muted-foreground">
            <tr className="h-10 border-b border-border">
              <th className="w-[238px] px-4 font-medium">Jogador</th>
              <th className="px-2 font-medium">Posição</th>
              <th className="px-2 font-medium">Overall</th>
              <th className="px-2 font-medium">Agilidade</th>
              <th className="px-2 font-medium">Idade</th>
              <th className="px-2 font-medium">Condição</th>
              <th className="px-2 font-medium">Valor base</th>
              <th className="px-2 font-medium">Valor de mercado</th>
              <th className="px-2 font-medium">Clube</th>
              <th className="w-[64px] min-w-[64px] px-2 text-right" />
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const club = player.club_id === null ? undefined : clubMap.get(player.club_id);
              return (
                <tr className="h-[49px] border-b border-border last:border-b-0" key={player.id}>
                  <td className="px-4">
                    <button
                      className="flex items-center gap-2 text-left"
                      onClick={() => onDetails?.(player)}
                      type="button"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                        {initials(player.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-foreground">
                          {player.name}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {positionLabels[player.position]}
                        </span>
                      </span>
                    </button>
                  </td>
                  <td className="w-[64px] min-w-[64px] px-2 pr-4 text-right">
                    <span className="rounded-md border border-border px-2 py-0.5 text-[11px]">
                      {player.position}
                    </span>
                  </td>
                  <td className="px-2 font-semibold">{player.overall}</td>
                  <td className="px-2">
                    <div className="flex items-center gap-2">
                      <span>{player.agility}</span>
                      <span className="h-1.5 w-9 overflow-hidden rounded-full bg-muted">
                        <span
                          className={`block h-full rounded-full ${
                            player.agility <= 33
                              ? "bg-destructive"
                              : player.agility > 67
                                ? "bg-success"
                                : "bg-muted-foreground"
                          }`}
                          style={{ width: `${player.agility}%` }}
                        />
                      </span>
                    </div>
                  </td>
                  <td className="px-2">{player.age}</td>
                  <td className="px-2">
                    <Badge variant={conditionVariants[player.condition]}>
                      • {conditionLabels[player.condition]}
                    </Badge>
                  </td>
                  <td className="px-2 text-muted-foreground">{money(player.base_value)}</td>
                  <td className="px-2 font-semibold">{money(player.market_value)}</td>
                  <td className="px-2">
                    {club ? (
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                          {club.acronym}
                        </span>
                        <span className="underline">{club.name}</span>
                      </span>
                    ) : (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Livre</span>
                    )}
                  </td>
                  <td className="px-2">
                    <div className="flex items-center justify-end gap-2">
                      {player.club_id === null && onBuy && (
                        <Button
                          className="h-8 px-2.5"
                          onClick={() => onBuy(player)}
                          size="sm"
                          variant="outline"
                        >
                          <ShoppingCart className="size-3.5" />
                          Comprar
                        </Button>
                      )}
                      <Button
                        aria-label={`Mais ações para ${player.name}`}
                        className="size-8"
                        onClick={() => onDetails?.(player)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="flex min-h-[53px] items-center justify-between border-t border-border px-4">
        <span className="text-[14px] text-muted-foreground">
          Mostrando {firstItem}–{lastItem} de {totalItems} jogadores
        </span>
        <div className="flex items-center gap-1">
          <Button
            className="px-2"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            variant="ghost"
          >
            ‹ Anterior
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map(
            (pageNumber) => (
              <Button
                className="size-8"
                key={pageNumber}
                onClick={() => onPageChange?.(pageNumber)}
                variant={pageNumber === page ? "outline" : "ghost"}
              >
                {pageNumber}
              </Button>
            ),
          )}
          <Button
            className="px-2"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
            variant="ghost"
          >
            Próxima ›
          </Button>
        </div>
      </footer>
    </section>
  );
}
