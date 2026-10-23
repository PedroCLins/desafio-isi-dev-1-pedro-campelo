"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { BaseModal, type ModalAction } from "@/components/modal";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import type { Player, Position } from "@/lib/types";

type DeletePlayerModalProps = {
  open: boolean;
  player: Player;
  onClose: () => void;
  onDeleted?: (player: Player) => void;
};

const positionLabels: Record<Position, string> = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  MEI: "Meio-campo",
  ATA: "Atacante",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DeletePlayerModal({
  open,
  player,
  onClose,
  onDeleted,
}: DeletePlayerModalProps) {
  const [submitting, setSubmitting] = React.useState(false);

  const remove = async () => {
    setSubmitting(true);
    try {
      await apiClient.players.remove(player.id);
      onDeleted?.(player);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAction: ModalAction = {
    label: "Cancelar",
    onClick: onClose,
  };
  const confirmAction: ModalAction = {
    label: "Excluir jogador",
    onClick: remove,
    loading: submitting,
    icon: <Trash2 className="size-4" />,
    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  return (
    <BaseModal
      className="!w-[460px] !max-w-[460px]"
      cancelAction={cancelAction}
      confirmAction={confirmAction}
      description="O jogador sai da lista e da busca, mas as transações e as partidas antigas dele continuam como foram gravadas."
      onClose={onClose}
      open={open}
      title={`Excluir ${player.name}?`}
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted-subtle px-3.5 py-3">
        <div
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[12px] font-medium text-primary"
        >
          {getInitials(player.name)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[14px] font-medium leading-5 text-foreground">
            {player.name}
          </span>
          <span className="text-[12px] leading-4 text-muted-foreground">
            {player.position} · {positionLabels[player.position]} · {player.age} anos
          </span>
        </div>
        <Badge variant="secondary">Livre</Badge>
      </div>
    </BaseModal>
  );
}