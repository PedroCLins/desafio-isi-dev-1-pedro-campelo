"use client";

import * as React from "react";
import axios from "axios";
import { CircleAlert, Shield, WalletCards } from "lucide-react";

import { BaseModal, type ModalAction } from "@/components/modal";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import type { Club, CreateClubInput } from "@/lib/types";

type CreateClubModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (club: Club) => void;
};

type ClubField = keyof CreateClubInput;
type ClubErrors = Partial<Record<ClubField, string>>;

function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return "Não foi possível criar o clube.";

  const message = error.response?.data?.message;
  return typeof message === "string" ? message : "Não foi possível criar o clube.";
}

function acronymMatchesName(name: string, acronym: string) {
  const letters = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  let position = 0;

  for (const letter of acronym) {
    position = letters.indexOf(letter, position);
    if (position === -1) return false;
    position += 1;
  }

  return true;
}

export function CreateClubModal({
  open,
  onClose,
  onCreated,
}: CreateClubModalProps) {
  const [form, setForm] = React.useState<CreateClubInput>({ name: "", acronym: "" });
  const [errors, setErrors] = React.useState<ClubErrors>({});
  const [submitError, setSubmitError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    // Reset the draft whenever a new creation flow is opened.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({ name: "", acronym: "" });
    setErrors({});
    setSubmitError("");
  }, [open]);

  const updateField = <K extends ClubField>(field: K, value: CreateClubInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  };

  const validate = () => {
    const nextErrors: ClubErrors = {};
    const name = form.name.trim();
    const words = name.split(/\s+/).filter(Boolean);

    if (name.length < 3 || name.length > 60) {
      nextErrors.name = "Use de 3 a 60 caracteres.";
    } else if (words.length < 2 || words.length > 5 || !/^[A-Za-zÀ-ÿ\s.'-]+$/.test(name)) {
      nextErrors.name = "Use de 2 a 5 palavras, somente letras, espaços, hífen e ponto.";
    }

    if (!/^[A-Z]{3}$/.test(form.acronym)) {
      nextErrors.acronym = "Use exatamente 3 letras maiúsculas.";
    } else if (!acronymMatchesName(name, form.acronym)) {
      nextErrors.acronym = "As letras devem aparecer no nome, na mesma ordem.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const club = await apiClient.clubs.create({
        name: form.name.trim(),
        acronym: form.acronym,
      });
      onCreated?.(club);
      onClose();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAction: ModalAction = { label: "Cancelar", onClick: onClose };
  const confirmAction: ModalAction = {
    label: "Criar clube",
    onClick: submit,
    loading: submitting,
  };

  return (
    <BaseModal
      className="max-w-[480px]"
      cancelAction={cancelAction}
      confirmAction={confirmAction}
      description="Informe o nome e a sigla do clube."
      onClose={onClose}
      open={open}
      title="Novo clube"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {submitError && (
          <div className="flex gap-3 rounded-xl border border-destructive-soft-border bg-destructive-soft px-3.5 py-3 text-destructive-soft-foreground">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-0.5 text-[14px] leading-5">
              <strong>Não foi possível criar o clube</strong>
              <span>{submitError}</span>
            </div>
          </div>
        )}

        <label className="flex flex-col gap-1.5 text-[14px] font-medium text-foreground">
          <span>Nome</span>
          <div className="relative">
            <Shield className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-invalid={Boolean(errors.name)}
              className="pl-9"
              maxLength={60}
              name="name"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ex.: Leões da Serra"
              value={form.name}
            />
          </div>
          <span className="text-[12px] leading-4 font-normal text-muted-foreground">
            {errors.name ??
              "De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube."}
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-[14px] font-medium text-foreground">
          <span>Sigla</span>
          <Input
            aria-invalid={Boolean(errors.acronym)}
            maxLength={3}
            name="acronym"
            onChange={(event) => updateField("acronym", event.target.value.toUpperCase())}
            placeholder="LDS"
            value={form.acronym}
          />
          <span className="text-[12px] leading-4 font-normal text-muted-foreground">
            {errors.acronym ??
              "3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira letra do nome."}
          </span>
        </label>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted-subtle px-3 py-2.5 text-[14px] text-muted-foreground">
          <WalletCards className="size-4 shrink-0" />
          <span>O clube começa com 300,00 em caixa e sem jogadores.</span>
        </div>
      </form>
    </BaseModal>
  );
}