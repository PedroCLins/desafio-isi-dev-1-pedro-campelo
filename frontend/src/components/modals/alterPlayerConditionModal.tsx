"use client";

import * as React from "react";
import { AlertTriangle, CircleCheck, LockKeyhole } from "lucide-react";

import { BaseModal, type ModalAction } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import type { Condition, Player } from "@/lib/types";

type AlterPlayerConditionModalProps = {
  open: boolean;
  player: Player;
  onClose: () => void;
  onSaved?: (player: Player) => void;
};

const conditionOptions: Array<{
  value: Condition;
  label: string;
  description: string;
}> = [
  {
    value: "APTO",
    label: "Apto",
    description: "Sem desconto por condição.",
  },
  {
    value: "MAL_CONDICIONADO",
    label: "Mal condicionado",
    description: "Desconto de 15%. Agilidade de 80 a 100 corta pela metade; de 1 a 30 soma 10 pontos.",
  },
  {
    value: "DOENTE",
    label: "Doente",
    description: "Desconto de 30%, com o mesmo ajuste de agilidade.",
  },
];

const conditionLabels: Record<Condition, string> = {
  APTO: "Apto",
  MAL_CONDICIONADO: "Mal condicionado",
  DOENTE: "Doente",
};

export function AlterPlayerConditionModal({
  open,
  player,
  onClose,
  onSaved,
}: AlterPlayerConditionModalProps) {
  const [condition, setCondition] = React.useState<Condition>(player.condition);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    // Reset the selection when the modal is reused for another player.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCondition(player.condition);
  }, [player]);

  const cannotBecomeFit = player.condition === "DOENTE";
  const save = async () => {
    if (cannotBecomeFit && condition === "APTO") return;

    setSubmitting(true);
    try {
      const updatedPlayer = await apiClient.players.updateCondition(player.id, condition);
      onSaved?.(updatedPlayer);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAction: ModalAction = { label: "Cancelar", onClick: onClose };
  const confirmAction: ModalAction = {
    label: "Salvar condição",
    onClick: save,
    loading: submitting,
  };

  return (
    <BaseModal
      className="!w-[520px] !max-w-[520px]"
      cancelAction={cancelAction}
      confirmAction={confirmAction}
      description="A condição muda o desconto do valor de mercado, recalculado ao salvar."
      onClose={onClose}
      open={open}
      title="Alterar condição física"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted-subtle p-3">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-[12px] font-medium text-primary">
              {player.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <p className="text-[14px] font-medium text-foreground">{player.name}</p>
              <p className="text-[12px] text-muted-foreground">
                {player.position} · {player.age} anos
              </p>
            </div>
          </div>
          <span className="rounded-full border border-success-soft-border bg-success-soft px-2 py-1 text-[12px] font-medium text-success-soft-foreground">
            • {conditionLabels[player.condition]}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {conditionOptions.map((option) => {
            const disabled = option.value === "APTO" && cannotBecomeFit;
            const selected = condition === option.value;

            return (
              <Button
                className="h-auto min-h-[64px] justify-start rounded-xl border border-border px-3 py-3 text-left"
                disabled={disabled}
                key={option.value}
                onClick={() => setCondition(option.value)}
                type="button"
                variant={selected ? "outline" : "ghost"}
              >
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-input">
                  {selected && <span className="size-2 rounded-full bg-primary" />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                  <span className="flex items-center gap-2 text-[14px] font-medium">
                    {option.label}
                    {player.condition === option.value && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[12px] font-medium">
                        Atual
                      </span>
                    )}
                  </span>
                  <span className="whitespace-normal break-words text-[12px] font-normal text-muted-foreground">
                    {option.description}
                  </span>
                  {disabled && (
                    <span className="flex items-center gap-1 text-[12px] font-normal text-muted-foreground">
                      <LockKeyhole className="size-3.5" />
                      De Doente não passa direto para Apto.
                    </span>
                  )}
                </span>
              </Button>
            );
          })}
        </div>

        {condition === "DOENTE" && player.club_id !== null && (
          <div className="flex gap-3 rounded-xl border border-warning-soft-border bg-warning-soft p-4 text-warning-soft-foreground">
            <AlertTriangle className="size-4 shrink-0" />
            <p className="text-[14px]">
              Ao passar a Doente, {player.name} sai da escalação e o clube precisa
              escalar novamente os 5 titulares antes da próxima partida.
            </p>
          </div>
        )}

        {condition === "APTO" && player.condition !== "APTO" && (
          <div className="flex items-center gap-2 text-[12px] text-success-soft-foreground">
            <CircleCheck className="size-4" />
            Condição apta, sem desconto por condição.
          </div>
        )}
      </div>
    </BaseModal>
  );
}