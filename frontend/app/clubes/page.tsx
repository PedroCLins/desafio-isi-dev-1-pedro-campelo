"use client";

import * as React from "react";
import { Plus, Shield } from "lucide-react";

import { ClubsTable } from "@/components/clubsTable";
import { CreateClubModal } from "@/components/modals/createClubModal";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import type { Club, ClubSort } from "@/lib/types";
import { toast } from "@/components/ui/toast";

export default function ClubsPage() {
  const [clubs, setClubs] = React.useState<Club[]>([]);
  const [sort, setSort] = React.useState<ClubSort>("net_worth_desc");
  const [createOpen, setCreateOpen] = React.useState(false);

  const loadClubs = React.useCallback(async () => {
    try {
      setClubs(await apiClient.clubs.list({ sort }));
    } catch {
      setClubs([]);
    }
  }, [sort]);

  React.useEffect(() => {
    // Load clubs whenever the selected sort changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadClubs();
  }, [loadClubs]);

  return (
    <>
        <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto p-6">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-primary bg-primary-soft text-primary">
                <Shield className="size-5" />
              </span>
              <div>
                <h1 className="text-[24px] leading-8 font-semibold">Clubes</h1>
                <p className="text-[14px] text-muted-foreground">
                  Cada clube começa com 300,00 em caixa e sem jogadores. A liga aceita no máximo 20 clubes.
                </p>
              </div>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Novo clube
            </Button>
          </header>
          <ClubsTable clubs={clubs} onSortChange={setSort} sort={sort} />
          <p className="text-[12px] text-muted-foreground">
            Clubes pelo nome por padrão ou pelo patrimônio, do maior para o menor, com empate desfeito pelo nome.
          </p>
        </main>
      <CreateClubModal
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false);
          await loadClubs();
          toast.add({
            title: "Clube criado",
            description: "O clube foi criado com sucesso e começa com 300,00 em caixa.",
            type: "success",
          });
        }}
        open={createOpen}
      />
    </>
  );
}
