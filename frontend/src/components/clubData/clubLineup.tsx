"use client";

import * as React from "react";
import Image from "next/image";
import axios from "axios";
import { Check, HeartPulse, Lock, Save, Swords, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import type { ClubDetails, Formation } from "@/lib/types";

type ClubPlayer = ClubDetails["players"][number];

const formations: Array<{ value: Formation; label: string; description: string }> = [
  { value: "3-1", label: "3-1", description: "Defesa 3, ataque 1" },
  { value: "2-2", label: "2-2", description: "Defesa 2, ataque 2" },
  { value: "2-1-1", label: "2-1-1", description: "Defesa 2, meio 1, ataque 1" },
  { value: "1-2-1", label: "1-2-1", description: "Defesa 1, meio 2, ataque 1" },
];

const pitchPositions: Record<Formation, Array<{ top: string; left: string }>> = {
  "3-1": [
    { top: "86%", left: "50%" },
    { top: "62%", left: "27%" },
    { top: "62%", left: "50%" },
    { top: "62%", left: "73%" },
    { top: "25%", left: "50%" },
  ],
  "2-2": [
    { top: "86%", left: "50%" },
    { top: "62%", left: "36%" },
    { top: "62%", left: "64%" },
    { top: "25%", left: "36%" },
    { top: "25%", left: "64%" },
  ],
  "2-1-1": [
    { top: "86%", left: "50%" },
    { top: "62%", left: "36%" },
    { top: "62%", left: "64%" },
    { top: "43%", left: "50%" },
    { top: "22%", left: "50%" },
  ],
  "1-2-1": [
    { top: "86%", left: "50%" },
    { top: "62%", left: "50%" },
    { top: "42%", left: "34%" },
    { top: "42%", left: "66%" },
    { top: "22%", left: "50%" },
  ],
};

type SlotRole = "goalkeeper" | "defender" | "midfielder" | "attacker";

const formationRoles: Record<Formation, SlotRole[]> = {
  "3-1": ["goalkeeper", "defender", "defender", "defender", "attacker"],
  "2-2": ["goalkeeper", "defender", "defender", "attacker", "attacker"],
  "2-1-1": ["goalkeeper", "defender", "defender", "midfielder", "attacker"],
  "1-2-1": ["goalkeeper", "defender", "midfielder", "midfielder", "attacker"],
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function lastName(name: string) {
  return name.trim().split(/\s+/).at(-1) ?? name;
}

function conditionLabel(condition: ClubPlayer["condition"]) {
  return condition === "MAL_CONDICIONADO" ? "Mal condicionado" : condition === "DOENTE" ? "Doente" : "Apto";
}

function conditionVariant(condition: ClubPlayer["condition"]) {
  return condition === "APTO" ? "success" : condition === "DOENTE" ? "destructive" : "warning";
}

function attributesUsed(player: ClubPlayer) {
  if (player.position === "GOL" || player.position === "ZAG") {
    return [["Defesa", player.defending]];
  }
  if (player.position === "LAT") {
    return [["Drible", player.dribbling], ["Defesa", player.defending]];
  }
  if (player.position === "MEI") {
    return [["Passe", player.passing]];
  }
  return [["Finalização", player.shooting]];
}

function roleLabel(role: SlotRole) {
  if (role === "goalkeeper") return { title: "Goleiro", positions: "GOL" };
  if (role === "defender") return { title: "Defesa", positions: "ZAG ou LAT" };
  if (role === "midfielder") return { title: "Meio", positions: "MEI" };
  return { title: "Ataque", positions: "ATA" };
}

function matchesRole(player: Pick<ClubPlayer, "position">, role: SlotRole) {
  if (role === "goalkeeper") return player.position === "GOL";
  if (role === "defender") return player.position === "ZAG" || player.position === "LAT";
  return player.position === (role === "midfielder" ? "MEI" : "ATA");
}

function FormationCards({ formation, onChange }: { formation: Formation; onChange: (value: Formation) => void }) {
  return (
    <RadioGroup
      className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
      onValueChange={(value) => onChange(value as Formation)}
      value={formation}
    >
      {formations.map((item) => (
        <label
          className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-left ${
            item.value === formation ? "border-primary bg-primary-soft ring-1 ring-primary" : "border-border"
          }`}
          key={item.value}
        >
          <Image alt="" className="size-10 shrink-0" height={52} src={`/Formação=${item.value}.svg`} width={40} />
          <RadioGroupItem aria-label={item.label} value={item.value} />
          <span>
            <span className="block text-[13px] font-medium">{item.label}</span>
            <span className="block text-[11px] text-muted-foreground">{item.description}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}

function PlayerToken({ player, position }: { player: ClubPlayer; position: { top: string; left: string } }) {
  const isFit = player.condition === "APTO";
  return (
    <div className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5" style={position}>
      <div className="relative">
        <span className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-medium text-primary-foreground shadow-md">
          {initials(player.name)}
        </span>
        {!isFit && (
          <div className="absolute -left-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full border-2 border-background bg-warning text-warning">
            <HeartPulse className="size-2.5 text-background" />
          </div>
        )}
      </div>
      <span className="whitespace-nowrap rounded-full bg-pitch-label px-2 py-0.5 text-[12px] font-medium leading-4 text-pitch-foreground">
        {lastName(player.name)}
      </span>
    </div>
  );
}

function Pitch({ formation, players }: { formation: Formation; players: Array<ClubPlayer | undefined> }) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#0d542b]">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_16.66%,transparent_16.66%,transparent_33.33%)]" />
      <div className="absolute inset-3 border border-white/40" />
      <div className="absolute inset-x-3 top-1/2 border-t border-white/40" />
      <div className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" />
      <div className="absolute inset-x-[18%] bottom-3 h-[25%] border border-white/40" />
      <div className="absolute inset-x-[35%] bottom-3 h-[10%] border border-white/40" />
      {players.slice(0, 5).map((player, index) => player && (
        <PlayerToken key={player.id} player={player} position={pitchPositions[formation][index]} />
      ))}
    </div>
  );
}

function StarterRow({ role, player, players, selectedIds, onChange }: { role: SlotRole; player?: ClubPlayer; players: ClubPlayer[]; selectedIds: number[]; onChange: (playerId: number) => void }) {
  const roleInfo = roleLabel(role);
  const candidates = players.filter((candidate) =>
    candidate.condition !== "DOENTE" &&
    matchesRole(candidate, role) &&
    (candidate.id === player?.id || !selectedIds.includes(candidate.id)),
  );

  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)_120px_48px_minmax(130px,1fr)] items-center gap-3 border-t border-border px-3 py-2 text-[12px]">
      <div>
        <strong>{roleInfo.title}</strong>
        <span className="block text-muted-foreground">{roleInfo.positions}</span>
      </div>
      <Select
        onValueChange={(value) => onChange(Number(value))}
        value={player ? String(player.id) : null}
      >
        <SelectTrigger className="min-w-0">
          <SelectValue placeholder="Selecionar jogador">
            {player ? `${player.name} (${player.position})` : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {candidates.map((candidate) => (
            <SelectItem key={candidate.id} value={String(candidate.id)}>
              {candidate.name} ({candidate.position})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {player ? <Badge variant={conditionVariant(player.condition)}>• {conditionLabel(player.condition)}</Badge> : <span />}
      <strong>{player?.overall ?? "-"}</strong>
      <div className="flex flex-wrap gap-2 text-muted-foreground">
        {player ? attributesUsed(player).map(([label, value]) => (
          <span key={label}>{label} <strong className="text-foreground">{value}</strong></span>
        )) : null}
      </div>
    </div>
  );
}

export function ClubLineup({ club }: { club: ClubDetails }) {
  const [formation, setFormation] = React.useState<Formation>(club.formation ?? "2-1-1");
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    void apiClient.league.getLineup(club.id).then((lineup) => {
      if (!mounted) return;
      const nextFormation = lineup.formation ?? club.formation ?? "2-1-1";
      const nextRoles = formationRoles[nextFormation];
      const eligibleIds = lineup.players
        .filter((player, index) => player.condition !== "DOENTE" && matchesRole(player, nextRoles[index]))
        .map((player) => player.id);
      setFormation(nextFormation);
      setSelectedIds(eligibleIds);
    }).catch(() => {
      if (mounted) setSelectedIds([]);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [club.id, club.formation]);

  const players = club.players ?? [];
  const roles = formationRoles[formation];
  const selectedSlots = selectedIds.map((id) => players.find((player) => player.id === id));
  const selectedPlayers = selectedSlots.filter((player): player is ClubPlayer => Boolean(player));
  const malConditionedPlayers = selectedPlayers.filter((player) => player.condition === "MAL_CONDICIONADO");
  const updateSlot = (index: number, playerId: number) => {
    setSelectedIds((current) => {
      const next = [...current];
      next[index] = playerId;
      return next;
    });
  };

  const changeFormation = (nextFormation: Formation) => {
    const nextRoles = formationRoles[nextFormation];
    setFormation(nextFormation);
    setSelectedIds((current) => current.map((id, index) => {
      const player = players.find((candidate) => candidate.id === id);
      return player && player.condition !== "DOENTE" && matchesRole(player, nextRoles[index]) ? id : 0;
    }));
  };

  const save = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      await apiClient.league.updateLineup(club.id, { formation, player_ids: selectedIds.filter(Boolean).slice(0, 5) });
      toast.add({ title: "Escalação salva", description: "A escalação do clube foi atualizada.", type: "success" });
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : undefined;
      const description = typeof message === "string" ? message : "Não foi possível salvar a escalação. Tente novamente.";
      toast.add({ title: "Falha ao salvar escalação", description, type: "error" });
      setSaveError(description);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mt-6 flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">Carregando escalação...</div>;

  return (
    <div className="mt-5 grid items-start gap-3 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
      <section className="self-start overflow-hidden rounded-xl border border-border">
        <div className="flex items-start justify-between border-b border-border p-4">
          <div><h2 className="font-semibold">Titulares</h2><p className="text-[12px] text-muted-foreground">1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar troca os 5 de uma vez.</p></div>
          <Badge variant={selectedPlayers.length === 5 ? "success" : "warning"}>{selectedPlayers.length === 5 ? <Check className="size-3" /> : <TriangleAlert className="size-3" />} {selectedPlayers.length === 5 ? "Completa" : "Incompleta"}</Badge>
        </div>
        <div className="border-b border-border p-4"><p className="text-[13px] font-medium">Formação</p><p className="mb-2 text-[11px] text-muted-foreground">Os números contam os jogadores de linha de trás para frente.</p><FormationCards formation={formation} onChange={changeFormation} /></div>
        <div className="grid grid-cols-[84px_minmax(0,1fr)_120px_48px_minmax(130px,1fr)] gap-3 bg-muted-subtle px-3 py-2 text-[12px] font-medium text-muted-foreground">
          <span>Vaga</span>
          <span>Titular</span>
          <span>Condição</span>
          <span>Overall</span>
          <span>Atributos usados</span>
        </div>
        {roles.map((role, index) => <StarterRow key={`${role}-${index}`} player={selectedSlots[index]} players={players} role={role} selectedIds={selectedIds} onChange={(id) => updateSlot(index, id)} />)}
        {malConditionedPlayers.length > 0 && (
          <div className="mx-4 my-3 rounded-lg border border-warning-soft-border bg-warning-soft px-3 py-2 text-[12px] text-warning-soft-foreground">
            <div className="flex items-center gap-2 font-medium">
              <TriangleAlert className="size-4" />
              {malConditionedPlayers.map((player) => player.name).join(" e ")} estão mal condicionados
            </div>
            <p className="ml-6 mt-1">Podem jogar, mas cada atributo vale 15% a menos durante a partida.</p>
          </div>
        )}
        {saveError && (
          <div className="mx-4 mb-3 rounded-lg border border-destructive-soft-border bg-destructive-soft px-3 py-2 text-[12px] text-destructive-soft-foreground">
            {saveError}
          </div>
        )}
        <div className="flex items-center gap-4 border-t border-border p-3">
          <p className="flex-1 text-[11px] leading-4 text-muted-foreground">
            A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela, e o clube volta a jogar depois de escalar de novo.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button disabled={saving || selectedPlayers.length === 0} onClick={() => setSelectedIds([])} variant="outline">Cancelar</Button>
            <Button disabled={saving || selectedPlayers.length !== 5} onClick={() => void save()}><Save className="size-4" />{saving ? "Salvando..." : "Salvar escalação"}</Button>
          </div>
        </div>
      </section>
      <aside className="space-y-3">
        <section className="rounded-xl border border-border p-4">
          <h2 className="font-semibold">Em campo</h2>
          <p className="mb-4 text-[12px] text-muted-foreground">
            Prévia da formação {formation}, do goleiro ao ataque.
          </p>
          <Pitch formation={formation} players={selectedSlots} />
          <p className="mt-3 text-[11px] text-muted-foreground">
            <Swords className="mr-1 inline size-3" />
            Na partida, atacam os 3 jogadores de linha mais avançados e defendem o goleiro e os 2 mais recuados. 
            É gol quando o ataque é maior que a defesa.
          </p>
        </section>
        <section className="rounded-xl border border-border p-4">
          <h2 className="font-semibold">Reservas</h2>
          <p className="mb-3 text-[12px] text-muted-foreground">
            Jogadores do elenco fora da escalação.
          </p>
          {players.filter((player) => 
            !selectedIds.includes(player.id))
            .map((player) => 
              <div className="flex items-center justify-between border-t border-border py-2 text-[12px]" key={player.id}>
                <span>{player.name}<small className="block text-muted-foreground">{player.position}</small></span>
                <Badge variant={conditionVariant(player.condition)}>• {conditionLabel(player.condition)}</Badge>
              </div>
            )
          }
          {players.some((player) => 
            player.condition === "DOENTE" && !selectedIds.includes(player.id)) && 
            <div className="mt-2 rounded-lg bg-muted-subtle px-3 py-2 text-[12px] text-muted-foreground">
              <Lock className="mr-1 inline size-3" />
              Doente não pode ser escalado.
            </div>
          }
        </section>
      </aside>
    </div>
  );
}
