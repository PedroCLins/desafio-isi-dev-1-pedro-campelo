"use client";

import * as React from "react";
import axios from "axios";
import {
  CalendarDays,
  CircleAlert,
  Clock3,
  Info,
  RefreshCw,
  ShoppingCart,
  Shield,
} from "lucide-react";

import { BaseModal, type ModalAction } from "@/components/modal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import type { BuyPlayerResponse, Club, PlayerWithValue, Position } from "@/lib/types";

type BuyPlayerModalProps = {
  open: boolean;
  player: PlayerWithValue;
  clubs: Club[];
  onClose: () => void;
  onBought?: (result: BuyPlayerResponse) => void;
  onViewClub?: (club: Club) => void;
};

type BuyError = {
  title: string;
  message: string;
};

const positionLabels: Record<Position, string> = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  MEI: "Meio-campo",
  ATA: "Atacante",
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const dateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function getApiError(error: unknown): BuyError {
  if (!axios.isAxiosError(error)) {
    return { title: "Sem conexão", message: "A compra não foi confirmada. Verifique a conexão e tente de novo." };
  }

  const message = error.response?.data?.error ?? error.response?.data?.message;
  if (typeof message !== "string") {
    return { title: "Sem conexão", message: "A compra não foi confirmada. Verifique a conexão e tente de novo." };
  }

  if (message.includes("maximum number")) {
    return { title: "Compra recusada", message: "O elenco do clube já tem 12 jogadores, o limite da liga." };
  }
  if (message.includes("sold by this club")) {
    return { title: "Compra recusada", message: "Este clube já vendeu esse jogador e não pode comprá-lo de novo." };
  }
  if (message.includes("another club")) {
    return { title: "Compra recusada", message: "Este jogador já pertence a outro clube." };
  }
  return { title: "Compra recusada", message };
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function BuyPlayerModal({
  open,
  player,
  clubs,
  onClose,
  onBought,
  onViewClub,
}: BuyPlayerModalProps) {
  const [clubId, setClubId] = React.useState("");
  const [date, setDate] = React.useState(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return dateValue(nextYear);
  });
  const [time, setTime] = React.useState("15:00");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<BuyError | null>(null);
  const [success, setSuccess] = React.useState<BuyPlayerResponse | null>(null);

  const club = clubs.find((item) => item.id === Number(clubId));
  const purchaseValue = player.market_value;
  const fee = purchaseValue > 30 ? Number((purchaseValue * 0.05).toFixed(2)) : 0;
  const totalCost = Number((purchaseValue + fee).toFixed(2));
  const selectedClubCash = club ? Number(club.cash) : 0;
  const canAfford = totalCost <= selectedClubCash * 0.5;

  React.useEffect(() => {
    if (!open) return;
    // Reset the purchase flow whenever a new player is opened.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClubId(clubs[0] ? String(clubs[0].id) : "");
    setError(null);
    setSuccess(null);
    setSubmitting(false);
  }, [open, player.id, clubs]);

  const submit = async () => {
    setError(null);
    if (!club || !date || !time) {
      setError({ title: "Compra recusada", message: "Selecione um clube e informe o fim da fidelidade." });
      return;
    }
    if (!canAfford) {
      setError({
        title: "Compra recusada",
        message: `O custo da compra (${money(totalCost)}) passa do limite de 50% do caixa (${money(selectedClubCash * 0.5)}).`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiClient.market.buy(player.id, {
        club_id: club.id,
        loyalty_until: `${date}T${time}:00-03:00`,
      });
      onBought?.(result);
      setSuccess(result);
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  if (success && club) {
    const successActions: ModalAction = {
      label: "Fechar",
      onClick: onClose,
    };
    const viewClubAction: ModalAction = {
      label: "Ver clube",
      onClick: () => onViewClub?.(club),
      variant: "outline",
    };

    return (
      <BaseModal
        className="max-w-[540px]"
        cancelAction={viewClubAction}
        confirmAction={successActions}
        description={`${player.name} agora é do ${club.name}.`}
        onClose={onClose}
        open={open}
        showSuccessIcon
        title="Compra concluída"
      >
        <div className="overflow-hidden rounded-xl border border-border">
          {[
            ["Valor", "Valor de mercado no momento da compra", money(success.contract.purchase_value)],
            ["Taxa", "5% do valor, porque passa de 30,00", money(success.value - success.contract.purchase_value)],
            ["Custo total", "Valor + taxa", money(success.value)],
            ["Fim da fidelidade", "", `${new Date(success.contract.loyalty_until).toLocaleDateString("pt-BR")} ${new Date(success.contract.loyalty_until).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`],
          ].map(([label, detail, value]) => (
            <div className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0" key={label}>
              <div>
                <p className="text-[14px] text-muted-foreground">{label}</p>
                {detail && <p className="text-[12px] text-muted-foreground">{detail}</p>}
              </div>
              <strong className="text-[14px] font-medium">{value}</strong>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border bg-muted-subtle px-4 py-3">
            <strong className="text-[14px]">Novo caixa do {club.name}</strong>
            <strong className="text-[16px]">{money(success.club_cash)}</strong>
          </div>
        </div>
      </BaseModal>
    );
  }

  const cancelAction: ModalAction = { label: "Cancelar", onClick: onClose };
  const confirmAction: ModalAction = {
    label: submitting ? "Comprando..." : error?.title === "Sem conexão" ? "Tentar de novo" : "Confirmar compra",
    onClick: submit,
    loading: submitting,
    icon: submitting ? <RefreshCw className="size-4 animate-spin" /> : error?.title === "Sem conexão" ? <RefreshCw className="size-4" /> : <ShoppingCart className="size-4" />,
  };

  return (
    <BaseModal
      className="max-w-[600px]"
      cancelAction={cancelAction}
      confirmAction={confirmAction}
      description="Escolha o clube comprador e até quando vai a fidelidade do contrato."
      loadingInfo={submitting ? "Enviando a compra. Os botões ficam desabilitados até a resposta." : undefined}
      onClose={onClose}
      open={open}
      title="Comprar jogador"
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="flex gap-3 rounded-xl border border-destructive-soft-border bg-destructive-soft px-4 py-3 text-destructive-soft-foreground">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="text-[14px] leading-5">
              <strong className="block">{error.title}</strong>
              <span>{error.message}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted-subtle px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[12px] font-medium">
            {getInitials(player.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium">{player.name}</p>
            <p className="text-[12px] text-muted-foreground">
              {player.position} · {positionLabels[player.position]} · {player.age} anos
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-muted-foreground">Valor de mercado</p>
            <strong className="text-[18px]">{money(purchaseValue)}</strong>
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-[14px] font-medium">
          <span>Clube comprador</span>
          <Select value={clubId} onValueChange={(value) => setClubId(value ?? "")}>
            <SelectTrigger>
              <Shield className="text-muted-foreground" />
              <SelectValue placeholder="Selecione um clube" />
            </SelectTrigger>
            <SelectContent>
              {clubs.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.name} ({item.acronym}) · caixa {money(Number(item.cash))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-[12px] font-normal text-muted-foreground">
            Caixa atual: {money(selectedClubCash)}. O custo total (valor + taxa) pode ir até 50% do caixa.
          </span>
        </label>

        <div className="flex flex-col gap-1.5 text-[14px] font-medium">
          <span>Fim da fidelidade</span>
          <div className="grid grid-cols-[1fr_136px] gap-2">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" min={dateValue(new Date())} onChange={(event) => setDate(event.target.value)} type="date" value={date} />
            </div>
            <div className="relative">
              <Clock3 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" onChange={(event) => setTime(event.target.value)} type="time" value={time} />
            </div>
          </div>
          <span className="text-[12px] leading-4 font-normal text-muted-foreground">
            Depois do momento da compra até 1.095 dias. Horário de Brasília; enviado com o fuso (-03:00).
          </span>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted-subtle px-3 py-2.5 text-[12px] font-normal text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>A taxa é de 5% do valor de mercado, só quando ele passa de 30,00. Taxa, custo e novo caixa são calculados ao confirmar.</span>
        </div>
      </div>
    </BaseModal>
  );
}