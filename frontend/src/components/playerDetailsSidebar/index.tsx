"use client";

import * as React from "react";
import {
  ChartNoAxesColumnIncreasing,
  HeartPulse,
  Pencil,
  ShoppingCart,
  Tag,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Condition, PlayerWithValue } from "@/lib/types";

type PlayerDetailsSidebarProps = {
  open: boolean;
  player: PlayerWithValue | null;
  onClose: () => void;
  onEdit?: (player: PlayerWithValue) => void;
  onConditionChange?: (player: PlayerWithValue) => void;
  onBuy?: (player: PlayerWithValue) => void;
};

const conditionLabels: Record<Condition, string> = {
  APTO: "Apto",
  MAL_CONDICIONADO: "Mal condicionado",
  DOENTE: "Doente",
};

const conditionVariants: Record<
  Condition,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  APTO: "success",
  MAL_CONDICIONADO: "warning",
  DOENTE: "destructive",
};

const indicators = [
  ["pace", "Velocidade"],
  ["shooting", "Finalização"],
  ["passing", "Passe"],
  ["dribbling", "Drible"],
  ["defending", "Defesa"],
  ["physical", "Físico"],
] as const;

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

function MetricCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl border border-border p-3">
      <div className="flex items-center justify-between text-[12px] text-muted-foreground">
        <span>{label}</span>
        <span>{icon}</span>
      </div>
      <strong className="text-[20px] leading-6 font-semibold text-foreground">
        {value}
      </strong>
      <span className="text-[11px] leading-4 text-muted-foreground">{description}</span>
    </div>
  );
}

export function PlayerDetailsSidebar({
  open,
  player,
  onClose,
  onEdit,
  onConditionChange,
  onBuy,
}: PlayerDetailsSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        className="!w-[480px] !max-w-[480px] gap-[18px] overflow-y-auto border-border bg-background p-6"
        side="right"
        showCloseButton
      >
        {player && (
          <>
            <SheetHeader className="flex-row items-center gap-3 p-0 pr-8">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-[14px] font-medium text-muted-foreground">
                {initials(player.name)}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <SheetTitle className="truncate text-[18px] leading-6 font-semibold">
                  {player.name}
                </SheetTitle>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline">{player.position}</Badge>
                  <Badge variant={conditionVariants[player.condition]}>
                    • {conditionLabels[player.condition]}
                  </Badge>
                  <Badge variant="secondary">
                    {player.club_id === null ? "Livre" : "Clube"}
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <MetricCard
                  description="Calculado automaticamente"
                  icon={<WalletCards className="size-3.5" />}
                  label="Valor de mercado"
                  value={money(player.market_value)}
                />
                <MetricCard
                  description="Calculado no cadastro"
                  icon={<Tag className="size-3.5" />}
                  label="Valor base"
                  value={money(player.base_value)}
                />
              </div>
              <div className="flex gap-2">
                <MetricCard
                  description="Calculado pela posição"
                  icon={<ChartNoAxesColumnIncreasing className="size-3.5" />}
                  label="Overall"
                  value={player.overall}
                />
                <MetricCard
                  description="Informado no cadastro"
                  icon={<TrendingUp className="size-3.5" />}
                  label="Potencial"
                  value={player.potential}
                />
              </div>

              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold">Indicadores técnicos</h2>
                  <span className="text-[12px] text-muted-foreground">Escala de 1 a 99</span>
                </div>
                <div className="flex flex-col gap-2">
                  {indicators.map(([field, label]) => {
                    const value = player[field];
                    return (
                      <div className="flex items-center gap-2" key={field}>
                        <span className="w-[70px] shrink-0 text-[12px] text-muted-foreground">
                          {label}
                        </span>
                        <div className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-primary/25"
                            style={{ width: `${Math.min(100, player.potential)}%` }}
                          />
                          <div
                            className="relative h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(100, value)}%` }}
                          />
                        </div>
                        <span className="w-5 text-right text-[12px] font-medium">{value}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-sm bg-primary" />
                    Valor do atributo
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-sm bg-primary/25" />
                    Até o potencial ({player.potential}), que nenhum atributo passa
                  </span>
                </div>
              </section>

              <div className="overflow-hidden rounded-xl border border-border">
                <div className="flex items-center justify-between border-b border-border px-3 py-2.5 text-[12px]">
                  <span className="text-muted-foreground">Idade</span>
                  <span>{player.age} anos</span>
                </div>
                <div className="flex items-center justify-between border-b border-border px-3 py-2.5 text-[12px]">
                  <span className="text-muted-foreground">Agilidade</span>
                  <span>{player.agility}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 text-[12px]">
                  <span className="text-muted-foreground">Clube</span>
                  <span>{player.club_id === null ? "Livre" : `Clube #${player.club_id}`}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
              <Button
                className="flex-1"
                onClick={() => onEdit?.(player)}
                variant="outline"
              >
                <Pencil className="size-4" />
                Editar
              </Button>
              <Button
                className="flex-1"
                onClick={() => onConditionChange?.(player)}
                variant="outline"
              >
                <HeartPulse className="size-4" />
                Alterar condição
              </Button>
              <Button
                className="flex-1"
                disabled={player.club_id !== null}
                onClick={() => onBuy?.(player)}
              >
                <ShoppingCart className="size-4" />
                Comprar
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
