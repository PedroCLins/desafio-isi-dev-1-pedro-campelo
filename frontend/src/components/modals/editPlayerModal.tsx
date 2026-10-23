"use client";

import * as React from "react";
import { CircleAlert, LockKeyhole } from "lucide-react";

import { BaseModal, type ModalAction } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import type { Player, Position, UpdatePlayerInput } from "@/lib/types";

type EditPlayerModalProps = {
  open: boolean;
  player: Player;
  onClose: () => void;
  onSaved?: (player: Player) => void;
};

const positions: Array<{ value: Position; label: string; description: string }> = [
  { value: "GOL", label: "GOL", description: "Goleiro" },
  { value: "ZAG", label: "ZAG", description: "Zagueiro" },
  { value: "LAT", label: "LAT", description: "Lateral" },
  { value: "MEI", label: "MEI", description: "Meio-campo" },
  { value: "ATA", label: "ATA", description: "Atacante" },
];

type EditableField = keyof UpdatePlayerInput;
type FormErrors = Partial<Record<EditableField, string>>;

function Field({
  label,
  name,
  value,
  error,
  description,
  min,
  max,
  maxLength,
  onChange,
}: {
  label: string;
  name: EditableField;
  value: string | number;
  error?: string;
  description: string;
  min?: number;
  max?: number;
  maxLength?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1.5 text-[14px] font-medium text-foreground">
      <span>{label}</span>
      <Input
        aria-invalid={Boolean(error)}
        name={name}
        onChange={(event) => {
          const rawValue = event.target.value;
          const nextValue =
            typeof value === "number" && maxLength
              ? rawValue.replace(/\D/g, "").slice(0, maxLength)
              : rawValue;
          onChange(nextValue);
        }}
        min={min}
        max={max}
        maxLength={maxLength}
        type={typeof value === "number" ? "number" : "text"}
        value={value}
      />
      <span className={error ? "flex items-start gap-1 text-[12px] font-normal text-destructive" : "text-[12px] font-normal text-muted-foreground"}>
        {error && <CircleAlert className="mt-0.5 size-3.5 shrink-0" />}
        {error ?? description}
      </span>
    </label>
  );
}

export function EditPlayerModal({
  open,
  player,
  onClose,
  onSaved,
}: EditPlayerModalProps) {
  const [form, setForm] = React.useState<UpdatePlayerInput>({
    name: player.name,
    position: player.position,
    age: player.age,
    agility: player.agility,
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    // Reset the draft when the modal is reused for another player.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      name: player.name,
      position: player.position,
      age: player.age,
      agility: player.agility,
    });
    setErrors({});
  }, [player]);

  const getErrors = (nextForm: UpdatePlayerInput) => {
    const nextErrors: FormErrors = {};
    if (nextForm.name.trim().length < 3 || nextForm.name.length > 100) {
      nextErrors.name = "Use de 3 a 100 caracteres.";
    }
    if (nextForm.age < 16 || nextForm.age > 45) {
      nextErrors.age = "Use uma idade de 16 a 45 anos.";
    }
    if (nextForm.agility < 1 || nextForm.agility > (nextForm.age >= 35 ? 85 : 100)) {
      nextErrors.agility = nextForm.age >= 35
        ? "Use uma agilidade de 1 a 85 para jogadores com 35 anos ou mais."
        : "Use um valor de 1 a 100.";
    }
    return nextErrors;
  };

  const updateField = <K extends EditableField>(
    field: K,
    value: UpdatePlayerInput[K],
  ) => {
    setForm((current) => {
      const nextForm = { ...current, [field]: value };
      setErrors(getErrors(nextForm));
      return nextForm;
    });
  };

  const save = async () => {
    const nextErrors = getErrors(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const updatedPlayer = await apiClient.players.update(player.id, form);
      onSaved?.(updatedPlayer);
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
    label: "Salvar alterações",
    onClick: save,
    loading: submitting,
    disabled: Object.keys(errors).length > 0,
  };

  return (
    <BaseModal
      className="!w-[560px] !max-w-[560px]"
      cancelAction={cancelAction}
      confirmAction={confirmAction}
      description="Edite nome, posição, idade e agilidade. Os demais dados não mudam."
      info={`Não mudam depois do cadastro: valor base (${Number(player.base_value).toFixed(2).replace(".", ",")}), indicadores e potencial.`}
      onClose={onClose}
      open={open}
      title="Editar jogador"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <Field
          label="Nome"
          name="name"
          onChange={(value) => updateField("name", value)}
          value={form.name}
          error={errors.name}
          description="De 3 a 100 caracteres, com pelo menos duas palavras e sem números."
          maxLength={100}
        />
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-medium">Posição</span>
          <div className="grid grid-cols-5 gap-2">
            {positions.map((position) => (
              <Button
                className={`h-[52px] flex-col gap-0 border-border shadow-none ${
                  form.position === position.value
                    ? "border-primary bg-primary-soft text-primary"
                    : "bg-background"
                }`}
                disabled={player.club_id !== null && player.position !== position.value}
                key={position.value}
                onClick={() => updateField("position", position.value)}
                type="button"
                variant={form.position === position.value ? "outline" : "ghost"}
              >
                <span className="font-semibold">{position.label}</span>
                <span className="text-[12px] font-normal text-muted-foreground">
                  {position.description}
                </span>
              </Button>
            ))}
          </div>
          {player.club_id !== null && (
            <p className="text-[12px] text-muted-foreground">
              Jogador com clube não muda de posição: as outras posições ficam desabilitadas.
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Idade"
            name="age"
            onChange={(value) => updateField("age", Number(value))}
            value={form.age}
            error={errors.age}
            description="De 16 a 45 anos."
            min={16}
            max={45}
            maxLength={2}
          />
          <Field
            label="Agilidade"
            name="agility"
            onChange={(value) => updateField("agility", Number(value))}
            value={form.agility}
            error={errors.agility}
            description="De 1 a 100 (até 85 com 35 anos ou mais)."
            min={1}
            max={form.age >= 35 ? 85 : 100}
            maxLength={3}
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-[14px] text-muted-foreground">
          <LockKeyhole className="size-4 shrink-0" />
          <span>
            Não mudam depois do cadastro: valor base ({Number(player.base_value).toFixed(2).replace(".", ",")}), indicadores e potencial.
          </span>
        </div>
      </form>
    </BaseModal>
  );
}