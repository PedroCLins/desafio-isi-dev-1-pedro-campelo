"use client";

import * as React from "react";
import { ChartNoAxesColumnIncreasing, CircleAlert, Lock } from "lucide-react";

import { BaseModal, type ModalAction } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreatePlayerInput, PlayerWithValue, Position } from "@/lib/types";

type CreatePlayerModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (player: CreatePlayerInput) => void | Promise<void>;
  initialValues?: Partial<CreatePlayerInput>;
  submitting?: boolean;
  success?: PlayerWithValue;
  onViewDetails?: (player: PlayerWithValue) => void;
};

const positions: Array<{ value: Position; label: string; description: string }> = [
  { value: "GOL", label: "GOL", description: "Goleiro" },
  { value: "ZAG", label: "ZAG", description: "Zagueiro" },
  { value: "LAT", label: "LAT", description: "Lateral" },
  { value: "MEI", label: "MEI", description: "Meio-campo" },
  { value: "ATA", label: "ATA", description: "Atacante" },
];

const statFields = [
  ["pace", "Velocidade"],
  ["shooting", "Finalização"],
  ["passing", "Passe"],
  ["dribbling", "Drible"],
  ["defending", "Defesa"],
  ["physical", "Físico"],
  ["potential", "Potencial"],
] as const;

const emptyForm: CreatePlayerInput = {
  name: "",
  position: "MEI",
  age: 18,
  agility: 1,
  pace: 1,
  shooting: 1,
  passing: 1,
  dribbling: 1,
  defending: 1,
  physical: 1,
  potential: 1,
};

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
  name: string;
  value: string | number;
  error?: string;
  description?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-[14px] font-medium text-foreground">
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
      {error ? (
        <span className="flex items-start gap-1 text-[12px] font-normal text-destructive">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </span>
      ) : description ? (
        <span className="text-[12px] font-normal text-muted-foreground">{description}</span>
      ) : null}
    </label>
  );
}

export function CreatePlayerModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  submitting = false,
  success,
  onViewDetails,
}: CreatePlayerModalProps) {
  const [form, setForm] = React.useState<CreatePlayerInput>({
    ...emptyForm,
    ...initialValues,
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof CreatePlayerInput, string>>
  >({});

  const getErrors = (nextForm: CreatePlayerInput) => {
    const nextErrors: Partial<Record<keyof CreatePlayerInput, string>> = {};
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
    for (const [field] of statFields) {
      if (nextForm[field] < 1 || nextForm[field] > 99) {
        nextErrors[field] = "Use um valor de 1 a 99.";
      }
    }
    const highestIndicator = Math.max(
      ...statFields.slice(0, 6).map(([field]) => nextForm[field]),
    );
    if (nextForm.potential < highestIndicator) {
      nextErrors.potential =
        "O potencial não pode ser menor que o maior indicador.";
    } else if (nextForm.age >= 33 && nextForm.potential > highestIndicator) {
      nextErrors.potential =
        "Com 33 anos ou mais, o potencial deve ser igual ao maior indicador.";
    }
    const attributeTotal = statFields
      .slice(0, 6)
      .reduce((sum, [field]) => sum + nextForm[field], 0);
    if (attributeTotal > 480 && !nextErrors.pace) {
      nextErrors.pace = "A soma dos seis atributos não pode passar de 480.";
    }
    return nextErrors;
  };

  const updateField = <K extends keyof CreatePlayerInput>(
    field: K,
    value: CreatePlayerInput[K],
  ) => {
    setForm((current) => {
      const nextForm = { ...current, [field]: value };
      setErrors(getErrors(nextForm));
      return nextForm;
    });
  };

  const validate = () => {
    const nextErrors = getErrors(form);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (validate()) await onSubmit?.(form);
  };

  const cancelAction: ModalAction = { label: "Cancelar", onClick: onClose };
  const confirmAction: ModalAction = {
    label: "Salvar jogador",
    onClick: submit,
    loading: submitting,
    disabled: Object.keys(errors).length > 0,
  };

  if (success) {
    return (
      <BaseModal
        className="max-w-[540px]"
        confirmAction={{ label: "Fechar", onClick: onClose }}
        cancelAction={{
          label: "Ver detalhes",
          onClick: () => onViewDetails?.(success),
          variant: "outline",
        }}
        description={`${success.name} entrou livre e Apto. Valores em moedas, calculados pela API ao salvar.`}
        onClose={onClose}
        open={open}
        showSuccessIcon
        title="Jogador cadastrado"
      >
        <div className="overflow-hidden rounded-xl border border-border">
          {[
            ["Valor base", "Calculado no cadastro; não muda depois", success.base_value],
            ["Valor de mercado", "Com condição, agilidade e idade", success.market_value],
            ["Overall", `Pelos pesos da posição ${success.position}`, success.overall],
          ].map(([label, detail, value], index) => (
            <div
              className="flex items-center justify-between gap-4 border-b border-border p-4 last:border-b-0"
              key={String(label)}
            >
              <div>
                <p className={index === 0 ? "text-[14px] font-semibold" : "text-[14px] text-muted-foreground"}>
                  {label}
                </p>
                <p className="text-[12px] text-muted-foreground">{detail}</p>
              </div>
              <strong className="text-[16px] font-medium">
                {typeof value === "number" ? value.toFixed(2).replace(".", ",") : value}
              </strong>
            </div>
          ))}
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      className="!w-[852px] !max-w-[852px]"
      confirmAction={confirmAction}
      cancelAction={cancelAction}
      description="Preencha os dados e os indicadores técnicos. O valor base, o overall e o valor de mercado são calculados ao salvar."
      info="O jogador começa livre e Apto."
      onClose={onClose}
      open={open}
      title="Novo jogador"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
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
        </div>
        <div className="grid grid-cols-3 gap-3">
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
          <div className="flex flex-col gap-1.5 text-[14px] font-medium text-muted-foreground">
            <span>Valor base (moedas)</span>
            <div className="flex h-9 items-center gap-1.5 rounded-md border border-dashed border-border bg-muted px-3 text-[14px] font-normal">
              <Lock className="size-4" />
              Após salvar
            </div>
            <span className="text-[12px] font-normal text-muted-foreground">Calculado no cadastro.</span>
          </div>
        </div>
        <div className="border-t border-border pt-4">
          <h3 className="text-[14px] font-semibold">Indicadores técnicos</h3>
          <p className="text-[12px] text-muted-foreground">
            Seis atributos e o potencial, de 1 a 99. Não mudam depois do cadastro;
            a soma dos seis atributos não pode passar de 480.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(4,minmax(0,1fr))_190px] gap-3">
          <div className="col-span-4 flex flex-col gap-3">
            <div className="grid grid-cols-4 gap-3">
              {statFields.slice(0, 4).map(([field, label]) => (
                <Field
                  key={field}
                  label={label}
                  name={field}
                  onChange={(value) => updateField(field, Number(value))}
                  value={form[field]}
                  error={errors[field]}
                  min={1}
                  max={99}
                  maxLength={3}
                />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {statFields.slice(4, 6).map(([field, label]) => (
                <Field
                  key={field}
                  label={label}
                  name={field}
                  onChange={(value) => updateField(field, Number(value))}
                  value={form[field]}
                  error={errors[field]}
                  min={1}
                  max={99}
                  maxLength={3}
                />
              ))}
              <Field
                label="Potencial"
                name="potential"
                onChange={(value) => updateField("potential", Number(value))}
                value={form.potential}
                error={errors.potential}
                description="≥ maior atributo; igual a ele com 33+ anos"
                min={1}
                max={99}
                maxLength={3}
              />
              <div className="flex min-w-0 flex-col gap-1.5 text-[14px] font-medium text-muted-foreground">
                <span>Overall</span>
                <div className="flex h-9 items-center gap-1.5 rounded-md border border-dashed border-border bg-muted px-3 text-[14px] font-normal">
                  <Lock className="size-4" />
                  Após salvar
                </div>
                <span className="text-[12px] font-normal">Calculado automaticamente.</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted-subtle p-3">
            <div className="mb-3 flex items-center gap-2 text-[12px] text-muted-foreground">
              <ChartNoAxesColumnIncreasing className="size-4" />
              Prévia dos atributos
            </div>
            {Object.keys(errors).length > 0 ? (
              <div className="flex min-h-[150px] flex-col items-center justify-center gap-2 text-center text-[12px] text-muted-foreground">
                <ChartNoAxesColumnIncreasing className="size-8 text-muted-foreground/40" />
                <span>Corrija os valores destacados para ver a prévia.</span>
              </div>
            ) : (
              <>
                {statFields.slice(0, 6).map(([field, label]) => (
                  <div
                    className="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground"
                    key={field}
                  >
                    <span className="w-14 truncate">{label}</span>
                    <div className="h-1 flex-1 rounded bg-primary/20">
                      <div
                        className="h-1 rounded bg-primary"
                        style={{ width: `${Math.min(100, form[field])}%` }}
                      />
                    </div>
                    <span className="w-4 text-right text-foreground">{form[field]}</span>
                  </div>
                ))}
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Faixa clara: até o potencial ({form.potential}). A prévia só desenha os
                  valores digitados; não calcula o overall nem o valor base.
                </p>
              </>
            )}
          </div>
        </div>
      </form>
    </BaseModal>
  );
}