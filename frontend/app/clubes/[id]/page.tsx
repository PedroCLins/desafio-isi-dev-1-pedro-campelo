"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Coins, Landmark, Shirt, UsersRound, Wallet } from "lucide-react";

import { ClubShield } from "@/components/clubShield";
import { ClubData } from "@/components/clubData";
import { SellPlayerModal } from "@/components/modals/sellPlayerModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import type { ClubDetails } from "@/lib/types";

function money(value: number | string) {
  return Number(value).toFixed(2).replace(".", ",");
}

export default function ClubDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [club, setClub] = React.useState<ClubDetails | null>(null);
  const [sellingPlayer, setSellingPlayer] = React.useState<ClubDetails["players"][number] | null>(null);

  React.useEffect(() => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return;
    void apiClient.clubs.get(id).then(setClub).catch(() => setClub(null));
  }, [params.id]);

  const refreshClub = React.useCallback(async () => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return;
    const updatedClub = await apiClient.clubs.get(id);
    setClub(updatedClub);
  }, [params.id]);

  if (!club) {
    return <main className="flex flex-1 items-center justify-center text-muted-foreground">Carregando clube...</main>;
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <ClubShield acronym={club.acronym} size="lg" />
          <div>
            <h1 className="text-[24px] leading-8 font-semibold">{club.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Sigla {club.acronym}</Badge>
              <Badge variant="outline">
                <Shirt className="size-3.5" />
                {club.players?.length ?? 0} de 12 jogadores
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push("/players")}>
          <UsersRound className="size-4" />
          Comprar jogadores
        </Button>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        {([
          ["Caixa", club.cash, "Só muda por compras e vendas", Wallet],
          ["Valor do elenco", club.squad_value, "Soma dos valores de mercado", Coins],
          ["Patrimônio", club.net_worth, "Caixa + valor do elenco", Landmark],
          ["Elenco", `${club.players?.length ?? 0} de 12`, "Limite de 12 jogadores", Shirt],
        ] as const).map(([label, value, description, Icon]) => (
          <div className="rounded-xl border border-border p-4 shadow-xs" key={String(label)}>
            <div className="flex items-center justify-between text-[14px] text-muted-foreground">
              <span>{label}</span>
              <Icon className="size-4" />
            </div>
            <p className="mt-2 text-[22px] font-semibold">
              {typeof value === "string" && value.includes(" de ") ? value : money(value as string | number)}
              {!String(value).includes(" de ") && <span className="ml-1 text-[12px] font-normal text-muted-foreground">moedas</span>}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>
      <ClubData
        club={club}
        onBuyPlayers={() => router.push("/players")}
        onSellPlayer={setSellingPlayer}
      />
      {sellingPlayer && (
        <SellPlayerModal
          club={club}
          loyaltyUntil={sellingPlayer.contract.loyalty_until}
          onClose={() => setSellingPlayer(null)}
          onSold={() => void refreshClub()}
          open
          player={sellingPlayer}
          purchaseValue={sellingPlayer.contract.purchase_value}
          remainingDays={sellingPlayer.contract.remaining_days}
        />
      )}
    </main>
  );
}
