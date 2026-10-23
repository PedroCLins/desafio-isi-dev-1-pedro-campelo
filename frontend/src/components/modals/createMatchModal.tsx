"use client";

import * as React from "react";
import axios from "axios";
import { CircleAlert, Info, Shield, Swords } from "lucide-react";

import { BaseModal, type ModalAction } from "@/components/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import type { Club, Match } from "@/lib/types";

type CreateMatchModalProps = {
  open: boolean;
  clubs: Club[];
  onClose: () => void;
  onCreated?: (match: Match) => void;
};

type MatchError = {
  title: string;
  message: string;
};

function getApiError(error: unknown): MatchError {
  if (!axios.isAxiosError(error)) {
    return {
      title: "Não foi possível jogar a partida",
      message: "Verifique a conexão e tente novamente.",
    };
  }

  const message = error.response?.data?.error ?? error.response?.data?.message;
  if (typeof message !== "string") {
    return {
      title: "Não foi possível jogar a partida",
      message: "Verifique a conexão e tente novamente.",
    };
  }

  if (message.includes("Home club")) {
    return {
      title: "Não foi possível jogar a partida",
      message: "Escalação incompleta: o mandante não tem os 5 titulares.",
    };
  }
  if (message.includes("Away club")) {
    return {
      title: "Não foi possível jogar a partida",
      message: "Escalação incompleta: o visitante não tem os 5 titulares.",
    };
  }
  if (message.includes("itself")) {
    return {
      title: "Não foi possível jogar a partida",
      message: "Escolha um clube visitante diferente do mandante.",
    };
  }

  return { title: "Não foi possível jogar a partida", message };
}

export function CreateMatchModal({
  open,
  clubs,
  onClose,
  onCreated,
}: CreateMatchModalProps) {
  const [homeClubId, setHomeClubId] = React.useState("");
  const [awayClubId, setAwayClubId] = React.useState("");
  const [error, setError] = React.useState<MatchError | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    // Reset selections whenever a new match flow is opened.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHomeClubId(clubs[0] ? String(clubs[0].id) : "");
    setAwayClubId(clubs[1] ? String(clubs[1].id) : "");
    setError(null);
  }, [open, clubs]);

  const awayOptions = clubs.filter((club) => String(club.id) !== homeClubId);

  const submit = async () => {
    setError(null);
    if (!homeClubId || !awayClubId) {
      setError({
        title: "Não foi possível jogar a partida",
        message: "Escolha o mandante e o visitante.",
      });
      return;
    }
    if (homeClubId === awayClubId) {
      setError({
        title: "Não foi possível jogar a partida",
        message: "Escolha um clube visitante diferente do mandante.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const match = await apiClient.league.createMatch({
        home_club_id: Number(homeClubId),
        away_club_id: Number(awayClubId),
      });
      onCreated?.(match);
      onClose();
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAction: ModalAction = { label: "Cancelar", onClick: onClose };
  const confirmAction: ModalAction = {
    label: "Jogar partida",
    onClick: submit,
    loading: submitting,
    icon: <Swords className="size-4" />,
  };

  return (
    <BaseModal
      className="max-w-[540px]"
      cancelAction={cancelAction}
      confirmAction={confirmAction}
      description="Escolha o mandante e o visitante. O placar sai dos atributos dos titulares, sem sorteio."
      loadingInfo={submitting ? "Enviando a partida. Os botões ficam desabilitados até a resposta." : undefined}
      onClose={onClose}
      open={open}
      title="Nova partida"
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="flex gap-3 rounded-xl border border-destructive-soft-border bg-destructive-soft px-3.5 py-3 text-destructive-soft-foreground">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="text-[14px] leading-5">
              <strong className="block">{error.title}</strong>
              <span>{error.message}</span>
            </div>
          </div>
        )}

        <label className="flex flex-col gap-1.5 text-[14px] font-medium">
          <span>Mandante</span>
          <Select
            value={homeClubId}
            onValueChange={(value) => {
              setHomeClubId(value ?? "");
              setError(null);
              if (value === awayClubId) setAwayClubId("");
            }}
          >
            <SelectTrigger>
              <Shield className="text-muted-foreground" />
              <SelectValue placeholder="Selecione o mandante" />
            </SelectTrigger>
            <SelectContent>
              {clubs.map((club) => (
                <SelectItem key={club.id} value={String(club.id)}>
                  {club.name} ({club.acronym})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-[12px] font-normal text-muted-foreground">
            Faz os 3 primeiros ataques.
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-[14px] font-medium">
          <span>Visitante</span>
          <Select
            value={awayClubId}
            onValueChange={(value) => {
              setAwayClubId(value ?? "");
              setError(null);
            }}
          >
            <SelectTrigger>
              <Shield className="text-muted-foreground" />
              <SelectValue placeholder="Selecione o visitante" />
            </SelectTrigger>
            <SelectContent>
              {awayOptions.map((club) => (
                <SelectItem key={club.id} value={String(club.id)}>
                  {club.name} ({club.acronym})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-[12px] font-normal text-muted-foreground">
            Precisa ser um clube diferente do mandante.
          </span>
        </label>

        <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted-subtle p-3 text-[12px] leading-4 text-muted-foreground">
          <div className="flex items-center gap-2 text-[14px] font-medium text-foreground">
            <Info className="size-4" />
            <span>Como sai o placar</span>
          </div>
          <p>
            Cada time faz 3 ataques. Pela ordem do elenco, os jogadores de linha vão do 1º (o mais recuado) ao 4º (o mais avançado): o 4º enfrenta o goleiro, o 3º enfrenta o 1º e o 2º enfrenta o 2º do adversário. O atacante usa finalização (ATA), passe (MEI) ou drible (ZAG e LAT), e quem defende usa defesa. É gol só quando o ataque é maior; mal condicionado joga com 15% a menos.
          </p>
          <p>
            Os dois clubes precisam ter os 5 titulares escalados. A partida não mexe no caixa.
          </p>
        </div>
      </div>
    </BaseModal>
  );
}