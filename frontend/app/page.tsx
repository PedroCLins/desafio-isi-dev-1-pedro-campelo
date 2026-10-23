"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { AlterPlayerConditionModal } from "@/components/modals/alterPlayerConditionModal";
import { BuyPlayerModal } from "@/components/modals/buyPlayerModal";
import { CreateClubModal } from "@/components/modals/createClubModal";
import { CreateMatchModal } from "@/components/modals/createMatchModal";
import { CreatePlayerModal } from "@/components/modals/createPlayerModal";
import { DeletePlayerModal } from "@/components/modals/deletePlayerModal";
import { EditPlayerModal } from "@/components/modals/editPlayerModal";
import { SellPlayerModal } from "@/components/modals/sellPlayerModal";
import { PlayerDetailsSidebar } from "@/components/playerDetailsSidebar";
import { PlayerFilters, type PlayerFiltersValue } from "@/components/playerFilters";
import {
  PlayersTable,
  type PlayersTableSort,
  type PlayersTableTab,
} from "@/components/playersTable";
import type { Club, PlayerWithValue } from "@/lib/types";

const demoClubs: Club[] = [
  {
    id: 1,
    name: "Águias FC",
    acronym: "AGU",
    cash: "300.00",
    formation: "2-2",
    squad_value: 0,
    net_worth: 300,
  },
  {
    id: 2,
    name: "Delta FC",
    acronym: "DEL",
    cash: "181.84",
    formation: "2-2",
    squad_value: 0,
    net_worth: 181.84,
  },
  {
    id: 3,
    name: "Gama SC",
    acronym: "GAM",
    cash: "300.00",
    formation: "2-2",
    squad_value: 0,
    net_worth: 300,
  },
];

const demoPlayer: PlayerWithValue = {
  id: 1,
  name: "Felipe Moura",
  position: "ZAG",
  agility: 70,
  age: 27,
  base_value: 44.2,
  condition: "APTO",
  club_id: 1,
  pace: 70,
  shooting: 62,
  passing: 68,
  dribbling: 55,
  defending: 82,
  physical: 76,
  potential: 80,
  market_value: 52,
  overall: 75,
};

export default function Home() {
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  const [detailsPlayer, setDetailsPlayer] = React.useState<PlayerWithValue | null>(null);
  const [playerTab, setPlayerTab] = React.useState<PlayersTableTab>("all");
  const [playerSort, setPlayerSort] = React.useState<PlayersTableSort>("name");
  const [playerFilters, setPlayerFilters] = React.useState<PlayerFiltersValue>({
    search: "",
  });
  const club = demoClubs[0];

  const closeModal = () => setActiveModal(null);
  const closeDetails = () => setDetailsPlayer(null);

  return (
    <main className="min-h-screen bg-muted-subtle px-6 py-12 font-sans">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-foreground">Modal gallery</h1>
          <p className="text-sm text-muted-foreground">
            Abra cada modal para revisar os estados e estilos implementados.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button onClick={() => setActiveModal("create-player")}>
            Novo jogador
          </Button>
          <Button onClick={() => setActiveModal("edit-player")} variant="outline">
            Editar jogador
          </Button>
          <Button onClick={() => setActiveModal("condition")} variant="outline">
            Alterar condição
          </Button>
          <Button onClick={() => setActiveModal("delete-player")} variant="outline">
            Excluir jogador
          </Button>
          <Button onClick={() => setActiveModal("create-club")}>
            Novo clube
          </Button>
          <Button onClick={() => setActiveModal("buy-player")}>
            Comprar jogador
          </Button>
          <Button onClick={() => setActiveModal("sell-player")} variant="outline">
            Vender jogador
          </Button>
          <Button onClick={() => setActiveModal("create-match")}>
            Nova partida
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          <PlayerFilters
            clubDisabled={playerTab === "free"}
            clubs={demoClubs}
            onChange={setPlayerFilters}
            value={playerFilters}
          />
          <PlayersTable
            clubs={demoClubs}
            counts={{ all: 1, clubs: 1, free: 0 }}
            onDetails={setDetailsPlayer}
            onSortChange={setPlayerSort}
            onTabChange={(tab) => {
              setPlayerTab(tab);
              if (tab === "free") {
                setPlayerFilters((current) => ({
                  ...current,
                  club_id: undefined,
                  free: true,
                }));
              } else if (playerTab === "free") {
                setPlayerFilters((current) => ({ ...current, free: undefined }));
              }
            }}
            players={[demoPlayer]}
            sort={playerSort}
            tab={playerTab}
          />
        </div>
      </section>

      <CreatePlayerModal
        onClose={closeModal}
        onSubmit={async () => undefined}
        open={activeModal === "create-player"}
        onViewDetails={(player) => {
          closeModal();
          setDetailsPlayer(player);
        }}
      />
      <EditPlayerModal
        onClose={closeModal}
        onSaved={closeModal}
        open={activeModal === "edit-player"}
        player={demoPlayer}
      />
      <AlterPlayerConditionModal
        onClose={closeModal}
        onSaved={closeModal}
        open={activeModal === "condition"}
        player={demoPlayer}
      />
      <DeletePlayerModal
        onClose={closeModal}
        onDeleted={closeModal}
        open={activeModal === "delete-player"}
        player={demoPlayer}
      />
      <CreateClubModal
        onClose={closeModal}
        onCreated={closeModal}
        open={activeModal === "create-club"}
      />
      <BuyPlayerModal
        clubs={demoClubs}
        onBought={closeModal}
        onClose={closeModal}
        open={activeModal === "buy-player"}
        player={{ ...demoPlayer, club_id: null }}
      />
      <SellPlayerModal
        club={club}
        isStarter
        loyaltyUntil="2027-04-04T15:45:00-03:00"
        onClose={closeModal}
        onSold={closeModal}
        onViewHistory={closeModal}
        open={activeModal === "sell-player"}
        player={demoPlayer}
        purchaseValue={44.2}
        remainingDays={144}
      />
      <CreateMatchModal
        clubs={demoClubs}
        onClose={closeModal}
        onCreated={closeModal}
        open={activeModal === "create-match"}
      />
      <PlayerDetailsSidebar
        onClose={closeDetails}
        open={detailsPlayer !== null}
        player={detailsPlayer}
      />
    </main>
  );
}
