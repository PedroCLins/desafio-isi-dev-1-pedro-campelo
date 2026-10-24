"use client";

import * as React from "react";
import { ClipboardList, HandCoins, History, Shirt, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ClubDetails } from "@/lib/types";
import { ClubLineup } from "./clubLineup";

type ClubDataProps = {
  club: ClubDetails;
  onBuyPlayers?: () => void;
  onSellPlayer?: (player: ClubDetails["players"][number]) => void;
};

type ClubTab = "squad" | "lineup" | "history";

const tabs: Array<{ id: ClubTab; label: string; count?: number; icon: typeof Shirt }> = [
  { id: "squad", label: "Elenco", count: undefined, icon: Shirt },
  { id: "lineup", label: "Escalação", icon: ClipboardList },
  { id: "history", label: "Histórico", count: 0, icon: History },
];

function money(value: number | string) {
  return Number(value).toFixed(2).replace(".", ",");
}

function conditionLabel(condition: string) {
  return condition === "MAL_CONDICIONADO" ? "Mal condicionado" : condition === "DOENTE" ? "Doente" : "Apto";
}

const conditionVariants = {
  APTO: "success",
  MAL_CONDICIONADO: "warning",
  DOENTE: "destructive",
} as const;

const avatarClasses = [
  "bg-avatar-violet text-avatar-violet-foreground",
  "bg-avatar-pink text-avatar-pink-foreground",
  "bg-avatar-cyan text-avatar-cyan-foreground",
  "bg-avatar-teal text-avatar-teal-foreground",
  "bg-avatar-zinc text-avatar-zinc-foreground",
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarClass(playerId: number) {
  return avatarClasses[playerId % avatarClasses.length];
}

function penaltyVariant(penaltyRate: number) {
  if (penaltyRate === 0) return "success";
  if (penaltyRate >= 20) return "destructive";
  return "warning";
}

function formatLoyaltyDate(value: string) {
  const date = new Date(value);
  return {
    date: date.toLocaleDateString("pt-BR"),
    time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function ClubData({ club, onBuyPlayers, onSellPlayer }: ClubDataProps) {
  const [activeTab, setActiveTab] = React.useState<ClubTab>("squad");
  const players = club.players ?? [];

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-10 items-end gap-1 border-b border-border">
        {tabs.map(({ id, label, count, icon: Icon }) => {
          const active = activeTab === id;
          const tabCount = id === "squad" ? players.length : count;
          return (
            <button
              className={`flex h-10 items-center gap-2 border-b-2 px-2 text-[14px] ${
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              key={id}
              onClick={() => setActiveTab(id)}
              type="button"
            >
              <Icon className="size-4" />
              <span>{label}</span>
              {tabCount !== undefined && (
                <span
                  className={`rounded-[9px] px-1.5 text-[12px] leading-5 ${
                    active
                      ? "bg-primary-soft text-primary-soft-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tabCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "squad" && (
        players.length === 0 ? (
          <div className="mt-6 flex min-h-[290px] flex-1 flex-col items-center justify-center rounded-xl border border-border text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Shirt className="size-6" />
            </span>
            <h2 className="font-semibold">Nenhum jogador no elenco</h2>
            <p className="mt-1 max-w-md text-[14px] leading-5 text-muted-foreground">
              Compre jogadores livres para montar o elenco. O limite é de 12
              jogadores, e o custo de cada compra não pode passar de 50% do caixa.
            </p>
            <Button className="mt-4" onClick={onBuyPlayers} variant="outline">
              <UsersRound className="size-4" />
              Ver jogadores livres
            </Button>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <div className="border-b border-border p-3">
              <h2 className="font-semibold">Elenco</h2>
              <p className="text-[12px] text-muted-foreground">
                Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome. Contrato calculado para uma venda agora
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-[12px]">
                <thead className="bg-muted-subtle text-left text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Jogador</th>
                    <th className="px-3 py-2">Posição</th>
                    <th className="px-3 py-2">Overall</th>
                    <th className="px-3 py-2">Condição</th>
                    <th className="px-3 py-2 text-right">Valor de mercado</th>
                    <th className="px-3 py-2 text-right">Valor de compra</th>
                    <th className="px-3 py-2">Fim da fidelidade</th>
                    <th className="px-3 py-2 text-right">Dias restantes</th>
                    <th className="px-3 py-2">% de multa</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr className="border-t border-border" key={player.id}>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${avatarClass(player.id)}`}>
                            {initials(player.name)}
                          </span>
                          <span className="font-medium">{player.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2"><Badge variant="outline">{player.position}</Badge></td>
                      <td className="px-3 py-2 font-semibold">{player.overall}</td>
                      <td className="px-3 py-2"><Badge variant={conditionVariants[player.condition]}>• {conditionLabel(player.condition)}</Badge></td>
                      <td className="px-3 py-2 text-right font-semibold">{money(player.market_value)}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{money(player.contract.purchase_value)}</td>
                      <td className="px-3 py-2">
                        {(() => {
                          const loyalty = formatLoyaltyDate(player.contract.loyalty_until);
                          return (
                            <>
                              <div>{loyalty.date}</div>
                              <div className="text-muted-foreground">{loyalty.time}</div>
                            </>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">{player.contract.remaining_days.toLocaleString("pt-BR")}</td>
                      <td className="px-3 py-2">
                        <Badge variant={penaltyVariant(player.contract.penalty_rate)}>
                          {player.contract.penalty_rate === 0 ? "✓ " : ""}
                          {player.contract.penalty_rate}%
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Button onClick={() => onSellPlayer?.(player)} size="sm" variant="outline">
                          <HandCoins className="size-4" />
                          Vender
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {activeTab === "lineup" && <ClubLineup club={club} />}

      {activeTab === "history" && (
        <div className="mt-6 flex min-h-[290px] flex-1 items-center justify-center rounded-xl border border-border text-[14px] text-muted-foreground">
          Esta seção ainda não possui dados.
        </div>
      )}
    </section>
  );
}
