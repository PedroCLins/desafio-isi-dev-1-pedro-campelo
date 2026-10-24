"use client";

import * as React from "react";
import { Plus, UsersRound } from "lucide-react";

import { AlterPlayerConditionModal } from "@/components/modals/alterPlayerConditionModal";
import { BuyPlayerModal } from "@/components/modals/buyPlayerModal";
import { CreatePlayerModal } from "@/components/modals/createPlayerModal";
import { EditPlayerModal } from "@/components/modals/editPlayerModal";
import { PlayerDetailsSidebar } from "@/components/playerDetailsSidebar";
import { PlayerFilters, type PlayerFiltersValue } from "@/components/playerFilters";
import {
  PlayersTable,
  type PlayersTableSort,
  type PlayersTableTab,
} from "@/components/playersTable";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import axios from "axios";
import { apiClient } from "@/lib/api";
import type { Club, PlayerWithValue } from "@/lib/types";

export default function PlayersPage() {
  const [clubs, setClubs] = React.useState<Club[]>([]);
  const [players, setPlayers] = React.useState<PlayerWithValue[]>([]);
  const [filters, setFilters] = React.useState<PlayerFiltersValue>({ search: "" });
  const [tab, setTab] = React.useState<PlayersTableTab>("all");
  const [sort, setSort] = React.useState<PlayersTableSort>("name");
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState({ total_items: 0, total_pages: 0 });
  const [counts, setCounts] = React.useState({ all: 0, free: 0, clubs: 0 });
  const [detailsPlayer, setDetailsPlayer] = React.useState<PlayerWithValue | null>(null);
  const [conditionPlayer, setConditionPlayer] = React.useState<PlayerWithValue | null>(null);
  const [buyPlayer, setBuyPlayer] = React.useState<PlayerWithValue | null>(null);
  const [editPlayer, setEditPlayer] = React.useState<PlayerWithValue | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    void apiClient.clubs.list({ sort: "name" }).then(setClubs).catch(() => setClubs([]));
  }, []);

  const loadPlayers = React.useCallback(async () => {
    const requestFilters = {
      ...filters,
      ...(tab === "free" ? { free: true, club_id: undefined } : {}),
      ...(tab === "clubs" ? { free: false } : {}),
      sort: [sort],
      page,
      limit: 10,
    };
    try {
      const response = await apiClient.players.list(requestFilters);
      setPlayers(response.data);
      setMeta(response.meta);
    } catch {
      setPlayers([]);
      setMeta({ total_items: 0, total_pages: 0 });
    }
  }, [filters, page, sort, tab]);

  React.useEffect(() => {
    // Load players whenever the API query state changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPlayers();
  }, [loadPlayers]);

  React.useEffect(() => {
    const loadCounts = async () => {
      const base = { search: filters.search, limit: 1, page: 1, sort: ["name"] as ("name")[] };
      const [all, free, clubPlayers] = await Promise.allSettled([
        apiClient.players.list(base),
        apiClient.players.list({ ...base, free: true }),
        apiClient.players.list({ ...base, free: false }),
      ]);
      setCounts({
        all: all.status === "fulfilled" ? all.value.meta.total_items : 0,
        free: free.status === "fulfilled" ? free.value.meta.total_items : 0,
        clubs: clubPlayers.status === "fulfilled" ? clubPlayers.value.meta.total_items : 0,
      });
    };
    void loadCounts();
  }, [filters.search]);

  const updateFilters = (next: PlayerFiltersValue) => {
    setPage(1);
    setFilters(next);
  };

  const changeTab = (nextTab: PlayersTableTab) => {
    setPage(1);
    setTab(nextTab);
    setFilters((current) => ({
      ...current,
      free: nextTab === "free" ? true : nextTab === "clubs" ? false : undefined,
      club_id: nextTab === "free" ? undefined : current.club_id,
    }));
  };

  return (
    <>
        <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto p-6">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-primary bg-primary-soft text-primary">
                <UsersRound className="size-5" />
              </span>
              <div>
                <h1 className="text-[24px] leading-8 font-semibold">Jogadores</h1>
                <p className="text-[14px] text-muted-foreground">
                  Cadastre jogadores, acompanhe os indicadores e compre os que estão livres.
                </p>
              </div>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Novo jogador
            </Button>
          </header>

          <PlayerFilters
            clubDisabled={tab === "free"}
            clubs={clubs}
            onChange={updateFilters}
            value={filters}
          />
          <PlayersTable
            clubs={clubs}
            counts={counts}
            onBuy={setBuyPlayer}
            onDetails={setDetailsPlayer}
            onPageChange={setPage}
            onSortChange={(nextSort) => {
              setSort(nextSort);
              setPage(1);
            }}
            onTabChange={changeTab}
            page={page}
            players={players}
            sort={sort}
            tab={tab}
            totalItems={meta.total_items}
            totalPages={meta.total_pages}
          />
          <p className="text-[12px] text-muted-foreground">
            O overall e o valor de mercado são calculados a cada consulta. A busca ignora
            maiúsculas, minúsculas e acentos.
          </p>
        </main>

      <PlayerDetailsSidebar
        onBuy={setBuyPlayer}
        onClose={() => setDetailsPlayer(null)}
        onConditionChange={setConditionPlayer}
        onEdit={(player) => {
          setDetailsPlayer(null);
          setEditPlayer(player);
        }}
        open={detailsPlayer !== null}
        player={detailsPlayer}
      />
      {editPlayer && (
        <EditPlayerModal
          onClose={() => setEditPlayer(null)}
          onSaved={async () => {
            setEditPlayer(null);
            await loadPlayers();
          }}
          open
          player={editPlayer}
        />
      )}
      {conditionPlayer && (
        <AlterPlayerConditionModal
          onClose={() => setConditionPlayer(null)}
          onSaved={() => setConditionPlayer(null)}
          open
          player={conditionPlayer}
        />
      )}
      {buyPlayer && (
        <BuyPlayerModal
          clubs={clubs}
          onBought={() => setBuyPlayer(null)}
          onClose={() => setBuyPlayer(null)}
          open
          player={buyPlayer}
        />
      )}
      <CreatePlayerModal
        onClose={() => setCreateOpen(false)}
        onSubmit={async (payload) => {
          try {
            await apiClient.players.create(payload);
            toast.add({ title: "Jogador criado", description: `${payload.name} foi criado com sucesso.`, type: "success" });
            setCreateOpen(false);
            await loadPlayers();
          } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.error : undefined;
            toast.add({
              title: "Falha ao criar jogador",
              description: typeof message === "string" ? message : "Não foi possível criar o jogador. Tente novamente.",
              type: "error",
            });
            throw error;
          }
        }}
        open={createOpen}
      />
    </>
  );
}
