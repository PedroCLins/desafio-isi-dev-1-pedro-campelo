"use client";

import * as React from "react";
import axios from "axios";
import { CircleAlert, History, Info, RefreshCw, Share2, TriangleAlert } from "lucide-react";

import { BaseModal, type ModalAction } from "@/components/modal";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import type { Club, PlayerWithValue, Position, SellPlayerResponse } from "@/lib/types";

type SellPlayerModalProps = {
  open: boolean;
  player: PlayerWithValue;
  club: Club;
  purchaseValue: number;
  loyaltyUntil: string;
  remainingDays?: number;
  isStarter?: boolean;
  onClose: () => void;
  onSold?: (result: SellPlayerResponse) => void;
  onViewHistory?: (player: PlayerWithValue) => void;
};

type SellError = { title: string; message: string };

const positionLabels: Record<Position, string> = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  MEI: "Meio-campo",
  ATA: "Atacante",
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (value: string) =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getApiError(error: unknown): SellError {
  if (!axios.isAxiosError(error)) {
    return { title: "Sem conexão", message: "A venda não foi confirmada. Verifique a conexão e tente de novo." };
  }

  const message = error.response?.data?.error ?? error.response?.data?.message;
  if (typeof message === "string" && message.includes("not linked")) {
    return { title: "A venda foi recusada", message: `${"Este jogador"} já está livre e não pode ser vendido.` };
  }
  return {
    title: error.response ? "A venda foi recusada" : "Sem conexão",
    message:
      typeof message === "string"
        ? message
        : "A venda não foi confirmada. Verifique a conexão e tente de novo.",
  };
}

export function SellPlayerModal({
  open,
  player,
  club,
  purchaseValue,
  loyaltyUntil,
  remainingDays: providedRemainingDays,
  isStarter = false,
  onClose,
  onSold,
  onViewHistory,
}: SellPlayerModalProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<SellError | null>(null);
  const [success, setSuccess] = React.useState<SellPlayerResponse | null>(null);
  const [now] = React.useState(() => Date.now());
  const remainingDays =
    providedRemainingDays ??
    Math.max(0, Math.ceil((new Date(loyaltyUntil).getTime() - now) / 86_400_000));
  const marketValue = player.market_value;

  const sell = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const result = await apiClient.market.sell(player.id);
      onSold?.(result);
      toast.add({ title: "Venda concluída", description: `${player.name} foi vendido com sucesso.`, type: "success" });
      setSuccess(result);
    } catch (requestError) {
      const details = getApiError(requestError);
      toast.add({ title: details.title, description: details.message, type: "error" });
      setError(details);
    } finally {
      setSubmitting(false);
    }
  };

  const historyAction: ModalAction = {
    label: "Ver histórico",
    onClick: () => onViewHistory?.(player),
    variant: "outline",
    icon: <History className="size-4" />,
  };
  const closeAction: ModalAction = { label: "Fechar", onClick: onClose };

  if (success) {
    const actualPenalty = success.penalty;
    const actualCommission = success.fee;
    const actualProfit = success.profit;

    return (
      <BaseModal
        className="max-w-[540px]"
        cancelAction={historyAction}
        confirmAction={closeAction}
        description={
          actualPenalty > 0
            ? `${player.name} voltou a ficar livre e saiu da escalação.`
            : `${player.name} voltou a ficar livre. A fidelidade já tinha terminado, então não houve multa.`
        }
        onClose={onClose}
        open={open}
        showSuccessIcon
        title="Venda concluída"
      >
        <div className="overflow-hidden rounded-xl border border-border">
          {[
            ["Valor de compra", "", money(success.purchase_value)],
            ["Valor de venda", "Valor de mercado no momento da venda", money(success.value)],
            ["Dias restantes", "", String(success.remaining_days)],
            ["Multa", actualPenalty > 0 ? "10% do valor de venda, com teto de 10,00" : "Fidelidade cumprida: sem multa", money(actualPenalty)],
            ["Lucro", "", `${actualProfit >= 0 ? "+" : ""}${money(actualProfit)}`],
            ["Comissão", actualCommission > 0 ? "10% do lucro até 10,00 + 20% do que passar" : "Sem lucro: sem comissão", money(actualCommission)],
          ].map(([label, detail, value]) => (
            <div className="flex items-center justify-between border-b border-border px-4 py-3" key={label}>
              <div>
                <p className="text-[14px] text-muted-foreground">{label}</p>
                {detail && <p className="text-[12px] text-muted-foreground">{detail}</p>}
              </div>
              <strong className={label === "Lucro" ? (actualProfit >= 0 ? "text-success" : "text-destructive") : "text-[14px] font-medium"}>
                {value}
              </strong>
            </div>
          ))}
          <div className="flex items-center justify-between border-b border-border bg-muted-subtle px-4 py-3">
            <div>
              <strong className="block text-[14px]">Crédito na caixa</strong>
              <span className="text-[12px] text-muted-foreground">Valor de venda − multa − comissão</span>
            </div>
            <strong className="text-[14px]">+{money(success.cash_change)}</strong>
          </div>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-[14px] text-muted-foreground">Contrato</span>
            <Badge variant={success.contract_status === "RESCINDIDO" ? "warning" : "secondary"}>
              {success.contract_status === "RESCINDIDO" ? "• RESCINDIDO" : "• ENCERRADO"}
            </Badge>
          </div>
          <div className="flex items-center justify-between bg-muted-subtle px-4 py-3">
            <strong className="text-[14px]">Novo caixa do {club.name}</strong>
            <strong className="text-[16px]">{money(success.club_cash)}</strong>
          </div>
        </div>
      </BaseModal>
    );
  }

  const cancelAction: ModalAction = { label: "Cancelar", onClick: onClose };
  const confirmAction: ModalAction = {
    label: "Confirmar venda",
    onClick: sell,
    loading: submitting,
    icon: submitting ? <RefreshCw className="size-4 animate-spin" /> : <Share2 className="size-4" />,
  };

  return (
    <BaseModal
      className="max-w-[470px]"
      cancelAction={cancelAction}
      confirmAction={confirmAction}
      description={`O jogador sai do elenco do ${club.name} e volta a ficar livre.`}
      loadingInfo={submitting ? "Enviando a venda. Os botões ficam desabilitados até a resposta." : undefined}
      onClose={onClose}
      open={open}
      title={`Vender ${player.name}?`}
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="flex gap-3 rounded-xl border border-destructive-soft-border bg-destructive-soft px-3 py-3 text-destructive-soft-foreground">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="text-[14px] leading-5">
              <strong className="block">{error.title}</strong>
              <span>{error.message}</span>
            </div>
          </div>
        )}
        {isStarter && (
          <div className="flex gap-3 rounded-xl border border-warning-soft-border bg-warning-soft px-3 py-3 text-warning-soft-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="text-[14px] leading-5">
              <strong className="block">{player.name} é titular</strong>
              <span>Ao vender, ele sai da escalação, e o {club.name} só volta a jogar partidas depois de escalar de novo os 5 titulares.</span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted-subtle px-3 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[12px] font-medium text-primary">
            {getInitials(player.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium">{player.name}</p>
            <p className="text-[12px] text-muted-foreground">{player.position} · {positionLabels[player.position]} · {player.age} anos</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-muted-foreground">Valor de mercado</p>
            <strong className="text-[18px]">{money(marketValue)}</strong>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          {[
            ["Valor de compra", money(purchaseValue)],
            ["Fim da fidelidade", formatDate(loyaltyUntil)],
            ["Dias restantes", String(remainingDays)],
            ["% de multa se vender agora", remainingDays > 0 ? "10%" : "0%"],
          ].map(([label, value]) => (
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5 last:border-b-0" key={label}>
              <span className="text-[14px] text-muted-foreground">{label}</span>
              <strong className="text-[14px] font-medium">{value}</strong>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted-subtle px-3 py-2.5 text-[12px] text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>A venda é pelo valor de mercado do momento. Multa (teto de 10,00), lucro, comissão e crédito são calculados ao confirmar.</span>
        </div>
      </div>
    </BaseModal>
  );
}